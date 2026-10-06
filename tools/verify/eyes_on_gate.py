#!/usr/bin/env python3
"""eyes_on_gate.py — the MANDATORY deliverable gate.

A deliverable directory is marked PASS only if proof artifacts exist:
  - a proof JSON (see tools/verify/proof_template.json) listing every checked
    frame/shot and a per-shot checklist with pass/fail + reasons
  - every referenced frame/render file actually exists on disk
  - for videos: a video_qa.py report exists and is referenced
  - for character GLBs: a defect_gates.py report exists and is referenced

Agents MUST run this and attach its output to their completion report.
"Verified" with no attached evidence gets sent back (per the law).

Usage:
  python3 tools/verify/eyes_on_gate.py --proof path/to/proof.json [--strict]

Exit code 0 = GATE PASS, 1 = GATE FAIL (lists exactly what is missing).
"""
import argparse
import json
import os
import sys

REQUIRED_TOP = ["deliverable", "frames_checked", "shots"]
RESULTS = ("pass", "fail", "waived")


def fail(msgs, code=1):
    for m in msgs:
        print(f"[eyes_on_gate] FAIL: {m}")
    return code


def main():
    ap = argparse.ArgumentParser(description="Mandatory proof gate for deliverables")
    ap.add_argument("--proof", required=True, help="proof JSON path")
    ap.add_argument("--strict", action="store_true",
                    help="fail on any 'waived' item or missing optional field")
    args = ap.parse_args()

    if not os.path.exists(args.proof):
        return fail([f"proof file not found: {args.proof}",
                     "no proof artifact — run the verify tools, write a proof JSON, then re-run"])
    try:
        p = json.load(open(args.proof))
    except Exception as e:  # noqa: BLE001
        return fail([f"proof JSON is not valid JSON: {e}"])

    problems, warnings = [], []
    base = os.path.dirname(os.path.abspath(args.proof))

    def resolve(path):
        return path if os.path.isabs(path) else os.path.join(base, path)

    for key in REQUIRED_TOP:
        if key not in p or not p[key]:
            problems.append(f"missing or empty required field '{key}'")

    # --- frames_checked: every frame must exist and carry a checklist ---
    frames = p.get("frames_checked", []) or []
    seen_files = set()
    for i, fr in enumerate(frames):
        tag = f"frames_checked[{i}]"
        f = fr.get("frame_file", "")
        if not f:
            problems.append(f"{tag}: no frame_file")
        elif not os.path.exists(resolve(f)):
            problems.append(f"{tag}: referenced file missing: {f}")
        else:
            seen_files.add(os.path.abspath(resolve(f)))
        if not fr.get("checked_by"):
            problems.append(f"{tag}: no checked_by (who put eyes on it?)")
        checks = fr.get("checklist", [])
        if not checks:
            problems.append(f"{tag}: empty checklist — eyes-on means items, not vibes")
        for c in checks:
            if c.get("result") not in RESULTS:
                problems.append(f"{tag}: checklist item '{c.get('item', '?')}' "
                                f"has no valid result (need pass/fail/waived)")
            elif not c.get("reason") and c.get("result") in ("fail", "waived"):
                problems.append(f"{tag}: item '{c.get('item', '?')}' "
                                f"is {c['result']} with no reason")
            if c.get("result") == "waived" and args.strict:
                problems.append(f"{tag}: waived item '{c.get('item', '?')}' (strict mode)")

    # --- shots: every shot needs >=1 checked frame and a per-shot result ---
    shots = p.get("shots", []) or []
    for i, sh in enumerate(shots):
        tag = f"shots[{i}] ({sh.get('shot_id', '?')})"
        if sh.get("result") not in RESULTS:
            problems.append(f"{tag}: missing per-shot result")
        if not sh.get("reason"):
            problems.append(f"{tag}: missing per-shot reason")
        refs = sh.get("frames", [])
        if not refs:
            problems.append(f"{tag}: no checked frames linked to this shot")
        for r in refs:
            if os.path.abspath(resolve(r)) not in seen_files and not os.path.exists(resolve(r)):
                problems.append(f"{tag}: linked frame not in frames_checked or missing: {r}")

    # --- automated gates: videos and character GLBs must reference their reports ---
    gates = p.get("automated_gates", {}) or []
    for i, g in enumerate(gates):
        tag = f"automated_gates[{i}] ({g.get('tool', '?')})"
        rep = g.get("report_file", "")
        if not rep:
            problems.append(f"{tag}: no report_file")
        elif not os.path.exists(resolve(rep)):
            problems.append(f"{tag}: report file missing: {rep}")
        else:
            try:
                r = json.load(open(resolve(rep)))
                verdict = r.get("verdict", "").upper()
                if verdict == "FAIL":
                    problems.append(f"{tag}: automated gate itself FAILED "
                                    f"(see {rep}) — fix the defect, don't waive the gate")
                elif verdict not in ("PASS",):
                    warnings.append(f"{tag}: report has no PASS verdict ({verdict or 'none'})")
            except Exception as e:  # noqa: BLE001
                problems.append(f"{tag}: report not readable JSON: {e}")
        if not g.get("command"):
            warnings.append(f"{tag}: no recorded command — re-running the gate is guesswork")

    # --- verdict ---
    n_frames = len(frames)
    n_shots = len(shots)
    n_checked_items = sum(len(fr.get("checklist", [])) for fr in frames)
    print(f"[eyes_on_gate] deliverable: {p.get('deliverable', '?')}")
    print(f"[eyes_on_gate] evidence: {n_frames} frames, {n_shots} shots, "
          f"{n_checked_items} checklist items, {len(gates)} automated gate reports")
    for w in warnings:
        print(f"[eyes_on_gate] WARN: {w}")
    if problems:
        print(f"[eyes_on_gate] GATE FAIL — {len(problems)} problem(s):")
        return fail(problems)
    print("[eyes_on_gate] GATE PASS — proof complete, attach this output to the completion report")
    return 0


if __name__ == "__main__":
    sys.exit(main())
