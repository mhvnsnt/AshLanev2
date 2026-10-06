#!/usr/bin/env python3
"""
tools/search/portfolio_repair.py — parallel-portfolio repair search.

Owner's hypothesis, implemented where it works: expensive search +
CHEAP VERIFIER -> automate the search with a portfolio of strategies and
let the verifier be the oracle. (The quantum version of this idea is
circular — the verifier IS the oracle — so the classical version captures
the gain today, for free.)

REAL repair problem: mesh-cleanup parameter search. A mesh with injected
corruption (duplicate vertices, degenerate faces, NaN normals — the exact
failure modes the repair lane hits) must be cleaned by choosing:
  weld_eps       — vertex weld distance
  deg_thresh     — degenerate-face area threshold
  smooth_iters   — Laplacian smoothing passes
  normal_mode    — keep vs recompute normals
The verifier scores the repaired mesh (same check family as
tools/verify/defect_gates.py static QC: NaN/exploded, degenerate faces,
duplicate verts, normal validity, plus shape-drift vs the clean mesh).

Strategies (the portfolio):
  random   — uniform random restarts (baseline single strategy)
  anneal   — simulated annealing over the discrete grid
  cpsat    — OR-Tools CP-SAT: constrained least-invasive-first enumeration.
             Real repair constraints (compute budget, normal/smooth guard)
             are modeled; each feasible config is verifier-scored.

Two portfolio variants:
  repair_search          — parallel: all arms in threads (cpsat in the
                           calling thread — OR-Tools aborts under threads),
                           split budget, shared evaluated cache, stop at
                           first PASS.
  repair_search_halving  — successive halving (algorithm selection):
                           round-robin elimination by per-arm best score,
                           winner spends the remaining budget. Total calls
                           <= budget: directly comparable to any single
                           strategy.

Measured 2026-10-06 (20 instances, 48-call budget): random 85%,
halving 70%, parallel 55%, anneal/cpsat 40%. Random restarts wins on
small discrete spaces (known result); halving is the most robust
portfolio (never worst on any profile; uniquely solved 2 instances).
The parallel split-budget variant is deprecated by evidence — see
docs/round6/quantum-v2-worklog.md for the full honest accounting.

Plug-in point for the ingest-QC gate (tools/verify/):
    from search.portfolio_repair import repair_search
    result = repair_search(damaged_mesh, budget=48)   # -> RepairResult
    # result.params / result.score / result.passed / result.calls / result.winner
See PLUG_IN.md.

Run the comparison experiment:
    ~/workspace/venvs/svenv/bin/python tools/search/portfolio_repair.py
Needs: numpy (system), ortools (svenv).
"""

import math
import os

# OpenBLAS SIGABRTs when its internal thread pool meets Python worker
# threads. The portfolio runs strategies in threads, so force
# single-threaded BLAS *before* numpy loads. (Hard-won, 2026-10-06:
# without this, any threaded run aborts with no traceback.)
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")

import random
import sys
import threading
import time

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

# ---------------------------------------------------------------------------
# Parameter space (discrete grid — CP-SAT native)
# ---------------------------------------------------------------------------

WELD_EPS = [0.0, 1e-6, 1e-5, 1e-4, 5e-4, 1e-3]
DEG_THRESH = [0.0, 1e-10, 1e-8, 1e-6]
SMOOTH_ITERS = [0, 1, 2, 4]
NORMAL_MODE = [0, 1]  # 0=keep, 1=recompute

PASS_SCORE = 1.0  # verifier score below this = repaired


# ---------------------------------------------------------------------------
# Mesh: procedural clean mesh + injected corruption (seeded, reproducible)
# ---------------------------------------------------------------------------

def make_clean_mesh(n=20, seed=0):
    rng = np.random.default_rng(seed)
    xs = np.linspace(-1, 1, n)
    ys = np.linspace(-1, 1, n)
    xx, yy = np.meshgrid(xs, ys)
    zz = 0.3 * np.sin(3 * xx) * np.cos(3 * yy)
    verts = np.stack([xx.ravel(), yy.ravel(), zz.ravel()], axis=1)
    faces = []
    for j in range(n - 1):
        for i in range(n - 1):
            a, b = j * n + i, j * n + i + 1
            c, d = (j + 1) * n + i, (j + 1) * n + i + 1
            faces += [[a, b, d], [a, d, c]]
    return verts, np.array(faces, dtype=np.int64)


def corrupt_mesh(verts, faces, seed=1, profile="A"):
    """Inject the failure modes the repair lane actually sees.

    profile A "in-budget": exact duplicate verts + degenerate faces +
        NaN normals + light jitter. The optimum respects the gate's
        compute budget (CP-SAT feasible).
    profile B "max-weld": near-duplicate verts at 8e-4 (need weld 1e-3) +
        degenerate faces + NaN normals. The only passing configs need
        weld_idx=5 (max intervention) — CP-SAT's least-invasive-first order
        reaches them last, so it fails at a 48-call budget while stochastic
        strategies follow the score gradient to w=5. CP-SAT is slow here,
        not infeasible; the portfolio hedges both orderings.
    """
    rng = np.random.default_rng(seed)
    verts = verts.copy()
    faces = faces.copy()
    nv = len(verts)
    if profile == "A":
        ndup = nv // 20
        dup_idx = rng.choice(nv, ndup, replace=False)
        verts = np.vstack([verts, verts[dup_idx]])  # exact duplicates
    else:
        # Profile B "max-weld": near-duplicate verts at 8e-4. Only the most
        # aggressive weld (eps=1e-3, index 5) catches them, so the optimum
        # is NOT least-invasive: CP-SAT's least-invasive-first enumeration
        # must wade through ~150 cheaper configs first and fails at the
        # 48-call budget, while stochastic strategies follow the score
        # gradient straight to w=5.
        ndup = nv // 20
        dup_idx = rng.choice(nv, ndup, replace=False)
        off = np.zeros((ndup, 3))
        off[:, 0] = 8e-4  # near-dups: only weld_eps=1e-3 catches them
        verts = np.vstack([verts, verts[dup_idx] + off])
    # degenerate faces (collapsed)
    ndeg = len(faces) // 30
    di = rng.choice(len(faces), ndeg, replace=False)
    faces[di, 1] = faces[di, 0]
    # light jitter (weld must not merge legit neighbors: spacing is 0.105)
    ji = rng.choice(nv, nv // 10, replace=False)
    verts[ji] += rng.normal(0, 1e-4, (len(ji), 3))
    normals = np.zeros((len(verts), 3))
    normals[:, 2] = 1.0
    nn = rng.choice(len(normals), len(normals) // 50, replace=False)
    normals[nn] = np.nan  # NaN normals
    return verts, faces, normals


# ---------------------------------------------------------------------------
# Repair operators
# ---------------------------------------------------------------------------

def weld(verts, faces, eps):
    if eps <= 0:
        return verts, faces, np.arange(len(verts))
    nv = len(verts)
    remap = np.arange(nv)
    alive = np.ones(nv, bool)
    for i in range(nv):
        if not alive[i]:
            continue
        d = np.linalg.norm(verts - verts[i], axis=1)
        close = np.where((d < eps) & alive)[0]
        close = close[close != i]
        for j in close:
            remap[j] = remap[i]
            alive[j] = False
    faces = remap[faces]
    keep = np.where(alive)[0]
    new_id = -np.ones(nv, dtype=np.int64)
    new_id[keep] = np.arange(len(keep))
    return verts[keep], new_id[faces], keep


def face_areas(verts, faces):
    v0, v1, v2 = verts[faces[:, 0]], verts[faces[:, 1]], verts[faces[:, 2]]
    return 0.5 * np.linalg.norm(np.cross(v1 - v0, v2 - v0), axis=1)


def remove_degenerate(verts, faces, thresh):
    if thresh <= 0:
        return verts, faces
    keep = face_areas(verts, faces) >= thresh
    return verts, faces[keep]


def laplacian_smooth(verts, faces, iters):
    for _ in range(iters):
        adj = [[] for _ in range(len(verts))]
        for a, b, c in faces:
            for u, v in ((a, b), (b, c), (c, a)):
                adj[u].append(v)
                adj[v].append(u)
        new = verts.copy()
        for i, nb in enumerate(adj):
            if nb:
                new[i] = verts[nb].mean(axis=0)
        verts = new
    return verts


def fix_normals(verts, faces, normals, mode):
    # mode=0 (keep) does NOT repair: NaN normals stay and get penalized.
    # mode=1 recomputes from faces.
    if mode == 1:
        n = np.zeros_like(verts)
        v0, v1, v2 = verts[faces[:, 0]], verts[faces[:, 1]], verts[faces[:, 2]]
        fn = np.cross(v1 - v0, v2 - v0)
        for k, (a, b, c) in enumerate(faces):
            n[a] += fn[k]
            n[b] += fn[k]
            n[c] += fn[k]
        norms = np.linalg.norm(n, axis=1, keepdims=True)
        normals = np.divide(n, np.maximum(norms, 1e-12))
        normals[norms[:, 0] < 1e-12] = [0, 0, 1]
    return normals


def repair(damaged, params):
    wi, di, si, ni = params
    verts, faces, normals = (d.copy() for d in damaged)
    verts, faces, keep = weld(verts, faces, WELD_EPS[wi])
    normals = normals[keep]
    verts, faces = remove_degenerate(verts, faces, DEG_THRESH[di])
    if len(faces):
        verts = laplacian_smooth(verts, faces, SMOOTH_ITERS[si])
    normals = fix_normals(verts, faces, normals, NORMAL_MODE[ni])
    return verts, faces, normals


# ---------------------------------------------------------------------------
# Verifier — the oracle (same check family as defect_gates.py static QC)
# ---------------------------------------------------------------------------

def verify(repaired, clean_verts):
    verts, faces, normals = repaired
    nan_v = int(np.isnan(verts).sum())
    nan_n = int(np.isnan(normals).sum())
    exploded = int((np.abs(verts) > 1e6).sum())
    deg = int((face_areas(verts, faces) < 1e-12).sum()) if len(faces) else 0
    # duplicate verts: pairs closer than the max weld distance (1e-3).
    # Legit neighbor spacing on the test mesh is 0.105, so no false positives.
    dups = 0
    if len(verts) < 2000:
        for i in range(0, len(verts), 7):
            d = np.linalg.norm(verts[i + 1:] - verts[i], axis=1)
            dups += int((d < 1e-3).sum())
    nl = np.linalg.norm(normals, axis=1)
    nonunit = int(((np.abs(nl - 1.0) > 1e-3) | np.isnan(nl)).sum())
    # shape drift vs clean mesh: MAX vertex deviation (no vertex may move).
    # Over-processing (heavy weld/smooth) is penalized -> interior optimum.
    drift = 0.0
    if len(verts):
        d = np.linalg.norm(
            verts[:, None, :] - clean_verts[None, :, :], axis=2)
        drift = float(d.min(axis=1).max())
    score = (100 * nan_v + 100 * nan_n + 1000 * exploded + 10 * deg
             + 1 * dups + 5 * nonunit + 200 * drift)
    return score, {"nan_v": nan_v, "nan_n": nan_n, "deg": deg, "dups": dups,
                   "nonunit": nonunit, "drift": round(drift, 6)}


# ---------------------------------------------------------------------------
# Strategies
# ---------------------------------------------------------------------------

class SearchState:
    """Evaluation state. Supports arm-local views over a shared cache.

    A root state owns the evaluated dict, best, and stop event. An arm
    view (SearchState(shared=root)) shares the evaluated dict / stop
    event but counts its OWN calls and tracks its OWN best — so a
    per-arm budget means per-arm calls. merge_into_root() folds an
    arm's results back.
    """

    def __init__(self, shared=None):
        self.lock = threading.Lock()
        if shared is None:
            self.evaluated = {}  # params -> score (shared cache)
            self.first_by = {}   # params -> arm name (attribution)
            self.best = (None, math.inf)
            self.calls = 0
            self.stop = threading.Event()
            self._root = self
        else:
            root = shared
            self.evaluated = root.evaluated
            self.first_by = root.first_by
            self.lock = root.lock
            self.stop = root.stop
            self.best = (None, math.inf)  # arm-local
            self.calls = 0                # arm-local
            self._root = root

    def submit(self, params, score):
        with self.lock:
            if params not in self.evaluated:
                self.evaluated[params] = score
                self.first_by.setdefault(params, getattr(self, "arm", None))
                self.calls += 1
                if score < self.best[1]:
                    self.best = (params, score)
                root = self._root
                if root is not self and score < root.best[1]:
                    root.best = (params, score)
                if score < PASS_SCORE:
                    self.stop.set()
            return self.stop.is_set()

    def merge_into_root(self):
        """Fold arm-local call count into the root (scores are already
        shared via the evaluated dict)."""
        root = self._root
        if root is self:
            return
        with root.lock:
            root.calls += self.calls
            if self.best[1] < root.best[1]:
                root.best = self.best


def evaluate(params, damaged, clean_verts, state):
    if params in state.evaluated or state.stop.is_set():
        return state.evaluated.get(params, math.inf)
    score, _ = verify(repair(damaged, params), clean_verts)
    state.submit(params, score)
    return score


def random_params(rng):
    return (rng.randrange(len(WELD_EPS)), rng.randrange(len(DEG_THRESH)),
            rng.randrange(len(SMOOTH_ITERS)), rng.randrange(len(NORMAL_MODE)))


def strategy_random(damaged, clean_verts, state, budget, seed):
    rng = random.Random(seed)
    skips = 0
    while not state.stop.is_set() and state.calls < budget and skips < 500:
        p = random_params(rng)
        if p in state.evaluated:
            skips += 1
            continue
        skips = 0
        evaluate(p, damaged, clean_verts, state)


def strategy_anneal(damaged, clean_verts, state, budget, seed):
    rng = random.Random(seed)
    dims = [len(WELD_EPS), len(DEG_THRESH), len(SMOOTH_ITERS), len(NORMAL_MODE)]
    cur = random_params(rng)
    cur_s = evaluate(cur, damaged, clean_verts, state)
    T, cool = 8.0, 0.92
    skips = 0  # guard: shared cache may hold every neighbor (portfolio) —
    while not state.stop.is_set() and state.calls < budget and skips < 500:
        nxt = list(cur)
        j = rng.randrange(4)
        nxt[j] = min(max(nxt[j] + rng.choice([-1, 1]), 0), dims[j] - 1)
        nxt = tuple(nxt)
        if nxt in state.evaluated:
            skips += 1
            continue
        skips = 0
        s = evaluate(nxt, damaged, clean_verts, state)
        if s <= cur_s or rng.random() < math.exp(-(s - cur_s) / max(T, 1e-9)):
            cur, cur_s = nxt, s
        T *= cool


def strategy_cpsat(damaged, clean_verts, state, budget, seed):
    """OR-Tools CP-SAT: constrained least-invasive-first enumeration.

    Real repair constraints modeled, not invented:
      - compute budget: weld aggressiveness + smoothing passes <= 6
        (both cost repair time; the gate has a per-model time budget)
      - normal recompute + heavy smoothing forbidden (oversmooths detail)
    Objective: minimize total intervention (least invasive repair first —
    the standing repair principle). Each solve returns the next-best
    unblocked config; it is verifier-scored, then blocked so enumeration
    never repeats work.
    """
    from ortools.sat.python import cp_model
    blocked = []
    while not state.stop.is_set() and state.calls < budget:
        model = cp_model.CpModel()
        w = model.NewIntVar(0, len(WELD_EPS) - 1, "weld")
        d = model.NewIntVar(0, len(DEG_THRESH) - 1, "deg")
        s = model.NewIntVar(0, len(SMOOTH_ITERS) - 1, "smooth")
        n = model.NewIntVar(0, 1, "normal")
        model.Add(w + s <= 6)                       # compute budget
        b_recomp = model.NewBoolVar("b_recompute")
        model.Add(n == 1).OnlyEnforceIf(b_recomp)
        model.Add(n != 1).OnlyEnforceIf(b_recomp.Not())
        model.Add(s <= 1).OnlyEnforceIf(b_recomp)  # no recompute+heavy smooth
        b_nodeg = model.NewBoolVar("b_nodeg")
        model.Add(d == 0).OnlyEnforceIf(b_nodeg)
        model.Add(d != 0).OnlyEnforceIf(b_nodeg.Not())
        model.Add(n == 0).OnlyEnforceIf(b_nodeg)   # degenerate removal pairs
                                                  # with normal handling
        for i, (bw, bd, bs, bn) in enumerate(blocked):
            diffs = []
            for var, val, nm in ((w, bw, "w"), (d, bd, "d"),
                                 (s, bs, "s"), (n, bn, "n")):
                b = model.NewBoolVar(f"diff_{nm}_{i}")
                model.Add(var != val).OnlyEnforceIf(b)
                model.Add(var == val).OnlyEnforceIf(b.Not())
                diffs.append(b)
            model.AddBoolOr(diffs)  # forbid this exact config
        model.Minimize(w + d + s + n)               # least invasive first
        solver = cp_model.CpSolver()
        solver.parameters.random_seed = seed
        if solver.Solve(model) not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            break  # no feasible configs left
        params = (int(solver.Value(w)), int(solver.Value(d)),
                  int(solver.Value(s)), int(solver.Value(n)))
        if params in state.evaluated:
            blocked.append(params)
            continue
        evaluate(params, damaged, clean_verts, state)
        blocked.append(params)


# ---------------------------------------------------------------------------
# Portfolio driver + plug-in entry point
# ---------------------------------------------------------------------------

STRATEGIES = {"random": strategy_random, "anneal": strategy_anneal,
              "cpsat": strategy_cpsat}


class RepairResult:
    def __init__(self, params, score, passed, calls, winner):
        self.params, self.score, self.passed = params, score, passed
        self.calls, self.winner = calls, winner


def repair_search_halving(damaged, clean_verts=None, budget=48, seed=0,
                          strategies=("random", "anneal", "cpsat")):
    """Successive-halving portfolio: algorithm selection, not just parallelism.

    Round 1: every arm gets budget/6 calls. Drop the worst arm (highest
    best-score among the configs IT first evaluated). Round 2: survivors
    get budget/8 each; drop worst again. Round 3: the winner spends the
    rest. One shared evaluated cache throughout (arms never re-score),
    stop early at the first PASS. Total verifier calls <= budget, so this
    is directly comparable to any single strategy at the same budget.

    Why it can genuinely win: it spends the budget on the arm that proves
    itself on THIS instance (random on dense instances, anneal where the
    score has a gradient, cpsat where the optimum is least-invasive)
    instead of pre-committing to one ordering.
    """
    if clean_verts is None:
        clean_verts = damaged[0]
    state = SearchState()
    alive = list(strategies)
    plan = [(len(alive), budget // 6), (2, budget // 8)]
    for rnd, (n_arms, allowance) in enumerate(plan):
        alive = alive[:n_arms]
        if len(alive) <= 1 or state.stop.is_set():
            break
        for i, name in enumerate(alive):
            sub = SearchState(shared=state)  # own budget, shared cache
            sub.arm = name
            STRATEGIES[name](damaged, clean_verts, sub, allowance,
                             seed * 131 + rnd * 17 + i)
            sub.merge_into_root()
            if state.stop.is_set():
                break
        if state.stop.is_set() or len(alive) <= 1:
            break
        # rank arms by the best score among configs each first evaluated
        best_of = {}
        for name in alive:
            scores = [s for p, s in state.evaluated.items()
                      if state.first_by.get(p) == name]
            best_of[name] = min(scores) if scores else math.inf
        alive = sorted(alive, key=lambda n: best_of[n])[:-1]  # drop worst
    if not state.stop.is_set() and alive:
        sub = SearchState(shared=state)
        sub.arm = alive[0]
        remaining = max(0, budget - state.calls)
        STRATEGIES[alive[0]](damaged, clean_verts, sub, remaining,
                             seed * 131 + 999)
        sub.merge_into_root()
    params, score = state.best
    return RepairResult(params, score, score < PASS_SCORE, state.calls,
                        "portfolio-halving")
def repair_search(damaged, clean_verts=None, budget=48, seed=0,
                  strategies=("random", "anneal", "cpsat")):
    """Plug-in entry point for the ingest-QC gate.

    damaged: (verts, faces, normals) with corruption.
    Returns RepairResult with the winning params. The verifier (verify())
    is the oracle; strategies share one evaluated cache and stop together
    at the first PASS.

    Parallelism note: OR-Tools aborts under Python threads (hard crash),
    so cpsat runs in the calling thread while the stochastic strategies
    run in worker threads. The shared currency is verifier calls.
    """
    if clean_verts is None:
        clean_verts = damaged[0]
    state = SearchState()
    per = max(1, budget // max(1, len(strategies)))
    threaded = [n for n in strategies if n != "cpsat"]

    def run_arm(name, arm_seed):
        # arm-local view: own call budget, shared evaluated cache
        sub = SearchState(shared=state)
        sub.arm = name
        STRATEGIES[name](damaged, clean_verts, sub, per, arm_seed)
        sub.merge_into_root()

    threads = [threading.Thread(target=run_arm,
                                args=(name, seed * 7919 + i), daemon=True)
               for i, name in enumerate(threaded)]
    for t in threads:
        t.start()
    if "cpsat" in strategies:  # main thread: OR-Tools is not thread-safe
        run_arm("cpsat", seed * 7919 + len(threaded))
    for t in threads:
        t.join()
    params, score = state.best
    return RepairResult(params, score, score < PASS_SCORE, state.calls,
                        "portfolio")


# ---------------------------------------------------------------------------
# Comparison experiment: portfolio vs each single strategy
# ---------------------------------------------------------------------------

def run_single(name, damaged, clean_verts, budget, seed):
    state = SearchState()
    STRATEGIES[name](damaged, clean_verts, state, budget, seed)
    return state.best[1], state.calls


def main():
    clean = make_clean_mesh(20, seed=0)
    print(f"mesh: {len(clean[0])} verts, {len(clean[1])} faces | "
          f"grid={len(WELD_EPS)}x{len(DEG_THRESH)}x{len(SMOOTH_ITERS)}x"
          f"{len(NORMAL_MODE)}=192 configs | budget=48 verifier calls")
    names = ["random", "anneal", "cpsat"]
    portfolios = [("par", repair_search), ("halv", repair_search_halving)]
    t0 = time.time()
    NSEEDS = 10
    for profile in ("A", "B"):
        cols = names + [p[0] for p in portfolios]
        wins = {n: 0 for n in cols}
        calls_to_pass = {n: [] for n in cols}
        for seed in range(NSEEDS):
            damaged = corrupt_mesh(*clean, seed=100 + seed, profile=profile)
            results = {}
            for n in names:
                score, calls = run_single(n, damaged, clean[0], 48, seed)
                results[n] = (score < PASS_SCORE, calls, score)
            for tag, fn in portfolios:
                r = fn(damaged, clean[0], budget=48, seed=seed)
                results[tag] = (r.passed, r.calls, r.score)
            for n in cols:
                ok, calls, score = results[n]
                if ok:
                    wins[n] += 1
                    calls_to_pass[n].append(calls)
            line = "  ".join(
                f"{n:6s}:{'PASS' if results[n][0] else 'fail':4s}"
                f"({results[n][1]:2d})" for n in cols)
            print(f"profile {profile} seed {seed:2d}  {line}", flush=True)
        print(f"\nprofile {profile}: {NSEEDS} seeds", flush=True)
        print(f"{'strategy':6s} {'pass_rate':>9s} {'mean_calls_to_pass':>18s}",
              flush=True)
        for n in cols:
            c = calls_to_pass[n]
            mean_c = f"{sum(c)/len(c):.1f}" if c else "n/a"
            print(f"{n:6s} {wins[n]/NSEEDS:>8.0%} {mean_c:>18s}", flush=True)
        print(flush=True)
    print(f"total {time.time()-t0:.1f}s", flush=True)


if __name__ == "__main__":
    main()
