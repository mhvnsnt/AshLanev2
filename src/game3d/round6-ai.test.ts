/**
 * Round 6 wiring tests: opponent-brain (Yuka) + dialogue-runtime (inkjs).
 * Run: node --experimental-strip-types --test src/game3d/round6-ai.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  OpponentBrain,
  buildPercept,
  difficultyFor,
  type CombatantView,
} from "./opponent-brain.ts";
import {
  BeatsRunner,
  InkRunner,
  STATIC_BACKSTAGE_BEATS,
} from "./dialogue/dialogue-runtime.ts";
import { InkDialogueSession } from "./dialogue/ink-adapter.ts";

const here = dirname(fileURLToPath(import.meta.url));
const DT = 1 / 60;

function mkSelf(id: number, x = 0, z = 0): CombatantView {
  return { id, kind: "grunt", x, y: 0, z, hp: 30, maxHp: 30, state: "free", stateT: 0, swung: false, cd: 0, arch: "hood", alive: true };
}
function mkFoe(x = 1, z = 0, state = "free"): CombatantView {
  return { id: 999, kind: "player", x, y: 0, z, hp: 100, maxHp: 100, state, stateT: 0, swung: false, cd: 0, arch: "player", alive: true };
}
function tickBrain(brain: OpponentBrain, self: CombatantView, foe: CombatantView, others: CombatantView[], t: number) {
  brain.perceive(buildPercept(self, foe, others, t));
  return brain.decide(DT);
}

// ---------- difficulty tiers ----------
test("difficultyFor maps arch + mission to tiers", () => {
  assert.equal(difficultyFor("brute", 0), "hard");
  assert.equal(difficultyFor("brute", 7), "boss");
  assert.equal(difficultyFor("hex", 3), "hard");
  assert.equal(difficultyFor("hood", 0), "normal");
  assert.equal(difficultyFor("runner", 9), "normal");
  assert.equal(difficultyFor("goon", 0), "easy");
  assert.equal(difficultyFor("goon", 5), "normal");
});

// ---------- reaction delay: no input reading ----------
test("brain does NOT perceive a player attack before the reaction delay", () => {
  const brain = new OpponentBrain("hard"); // 180ms
  const self = mkSelf(1), foe = mkFoe(1, 0, "atk");
  tickBrain(brain, self, foe, [self, foe], 1.0);
  assert.equal(brain.ctx.percept!.perceivedThreat, false);
  tickBrain(brain, self, foe, [self, foe], 1.1);
  assert.equal(brain.ctx.percept!.perceivedThreat, false, "still blind at 100ms");
  assert.equal(brain.pendingEvents() > 0, true, "event queued for later");
  tickBrain(brain, self, foe, [self, foe], 1.2);
  assert.equal(brain.ctx.percept!.perceivedThreat, true, "perceives at 200ms");
});

test("easy grunts react slower than hard grunts", () => {
  const easy = new OpponentBrain("easy"); // 450ms
  const hard = new OpponentBrain("hard"); // 180ms
  const self = mkSelf(1), foe = mkFoe(1, 0, "atk");
  tickBrain(easy, self, foe, [self, foe], 1.0);
  tickBrain(hard, self, foe, [self, foe], 1.0);
  tickBrain(easy, self, foe, [self, foe], 1.3);
  tickBrain(hard, self, foe, [self, foe], 1.3);
  assert.equal(hard.ctx.percept!.perceivedThreat, true);
  assert.equal(easy.ctx.percept!.perceivedThreat, false, "easy still blind at 300ms");
});

// ---------- attack utility ----------
test("shouldAttack: no piling on when an ally is mid-swing", () => {
  const brain = new OpponentBrain("boss");
  const p = buildPercept(mkSelf(1), mkFoe(), [mkSelf(1)], 0);
  p.allyAttacking = true;
  assert.equal(brain.shouldAttack(p), false);
});

test("shouldAttack: blocked while on cooldown", () => {
  const brain = new OpponentBrain("boss");
  const self = mkSelf(1); self.cd = 1.0;
  const p = buildPercept(self, mkFoe(), [self], 0);
  assert.equal(brain.shouldAttack(p), false);
});

test("shouldAttack: boss always punishes a whiff in range", () => {
  const brain = new OpponentBrain("boss"); // aggression 0.9 + 0.35 boost > 1
  const p = buildPercept(mkSelf(1), mkFoe(2, 0), [mkSelf(1)], 0);
  p.perceivedOpen = true;
  for (let i = 0; i < 20; i++) assert.equal(brain.shouldAttack(p), true);
});

test("shouldAttack: respects vertical gap", () => {
  const brain = new OpponentBrain("boss");
  const foe = mkFoe(1, 0); foe.y = 5;
  const p = buildPercept(mkSelf(1), foe, [mkSelf(1)], 0);
  p.perceivedOpen = true;
  assert.equal(brain.shouldAttack(p), false);
});

// ---------- state machine ----------
test("non-presser orbits, presser approaches", () => {
  const brain = new OpponentBrain("normal");
  const foe = mkFoe(10, 0);
  const near = mkSelf(1, 8, 0);
  const far = mkSelf(2, 0, 0);
  const intent = tickBrain(brain, far, foe, [near, far], 0);
  assert.equal(brain.stateId, "orbit");
  assert.ok(Math.abs(intent.moveX) < 1.2 && Math.abs(intent.moveZ) < 1.2);
  const brain2 = new OpponentBrain("normal");
  tickBrain(brain2, near, foe, [near, far], 0);
  assert.equal(brain2.stateId, "approach");
});

test("threatened grunt retreats (forced caution roll)", () => {
  const brain = new OpponentBrain("hard");
  const self = mkSelf(1), foe = mkFoe(1.5, 0, "atk");
  const realRandom = Math.random;
  Math.random = () => 0; // always below caution -> retreat
  try {
    tickBrain(brain, self, foe, [self, foe], 1.0);
    assert.equal(brain.ctx.percept!.perceivedThreat, false);
    tickBrain(brain, self, foe, [self, foe], 1.3);
    assert.equal(brain.ctx.percept!.perceivedThreat, true);
    assert.equal(brain.stateId, "retreat");
    const intent = brain.decide(DT);
    assert.ok(intent.moveX < 0, "moves away from player");
  } finally {
    Math.random = realRandom;
  }
});

test("buildPercept counts rank and detects ally swings", () => {
  const foe = mkFoe(10, 0);
  const near = mkSelf(1, 8, 0);
  const far = mkSelf(2, 0, 0);
  near.state = "atk"; near.swung = false;
  const p = buildPercept(far, foe, [near, far], 0);
  assert.equal(p.rank, 1);
  assert.equal(p.allyAttacking, true);
  assert.ok(Math.abs(p.dist - 10) < 1e-9);
});

// ---------- dialogue: beats ----------
test("BeatsRunner walks the Static backstage beats", () => {
  const r = new BeatsRunner(STATIC_BACKSTAGE_BEATS, "start", { player: "Real" });
  const l1 = r.next();
  assert.equal(l1.speaker, "STATIC");
  assert.ok(l1.line.includes("Real"), "variable interpolation works");
  assert.equal(l1.choices.length, 2);
  assert.equal(l1.done, false);
  const l2 = r.next(0); // "Nah, what happened?"
  assert.ok(l2.line.includes("I don't start it"));
  assert.equal(r.variables.heard_bus_story, true, "set() applied");
  const l3 = r.next(0); // "F*ck AWE..."
  assert.ok(l3.line.includes("EXACTLY"));
  assert.equal(l3.done, false, "terminal beat still emits its line");
  const end = r.next();
  assert.equal(end.done, true, "done only when nothing remains");
});

// ---------- dialogue: real ink ----------
const INK_JSON = readFileSync(join(here, "dialogue/stories/static-backstage.ink.json"), "utf8");

test("InkRunner plays compiled ink (author -> compile -> JSON -> runtime)", () => {
  const r = new InkRunner(INK_JSON);
  const l1 = r.next();
  assert.ok(l1.line.includes("bus"), "first line: " + l1.line);
  assert.equal(l1.choices.length, 2);
  const l2 = r.next(0); // choose "Nah, what happened?"
  assert.equal(l2.speaker, "STATIC");
  assert.ok(l2.line.includes("I don't start it"), "second line: " + l2.line);
  assert.equal(r.getVariable("met_static"), true, "ink variable set");
  const l3 = r.next(0);
  assert.ok(l3.line.includes("EXACTLY"));
});

// ---------- dialogue: UI adapter ----------
test("InkDialogueSession drives the existing DialogueEvent UI flow", () => {
  const sess = new InkDialogueSession(new InkRunner(INK_JSON));
  const e1 = sess.next();
  assert.equal(e1.kind, "line");
  if (e1.kind !== "line") throw new Error("unreachable");
  assert.equal(e1.speaker, "STATIC");
  const e2 = sess.next();
  assert.equal(e2.kind, "options");
  if (e2.kind !== "options") throw new Error("unreachable");
  assert.equal(e2.options.length, 2);
  const e3 = sess.choose(0);
  assert.equal(e3.kind, "line");
  if (e3.kind !== "line") throw new Error("unreachable");
  assert.ok(e3.text.includes("I don't start it"));
  const e4 = sess.next();
  assert.equal(e4.kind, "options");
  const e5 = sess.choose(0);
  assert.equal(e5.kind, "line");
  if (e5.kind !== "line") throw new Error("unreachable");
  assert.ok(e5.text.includes("EXACTLY"));
  assert.equal(sess.next().kind, "end");
});

test("InkDialogueSession works with beats runner too", () => {
  const sess = new InkDialogueSession(
    new BeatsRunner(STATIC_BACKSTAGE_BEATS, "start", { player: "Real" })
  );
  assert.equal(sess.next().kind, "line");
  const opts = sess.next();
  assert.equal(opts.kind, "options");
  if (opts.kind !== "options") throw new Error("unreachable");
  assert.equal(opts.options.length, 2);
  const line = sess.choose(1);
  assert.equal(line.kind, "line");
  if (line.kind !== "line") throw new Error("unreachable");
  assert.ok(line.text.includes("Lace up"));
  assert.equal(sess.next().kind, "end");
});
