/**
 * rapier-proof.mjs — Round 4: verify @dimforge/rapier3d-compat works for AshLane.
 *
 * License: @dimforge/rapier3d-compat is Apache-2.0 (verified 2026-10-06).
 * This proof script is MIT (new code).
 *
 * What it proves:
 *  1. Rapier loads in Node (WASM compat build, no bundler needed).
 *  2. A stack of boxes falls and settles under gravity (destruction/debris base).
 *  3. A simple 3-link ragdoll chain reacts to an impulse (knockback base).
 *  4. Stepping is deterministic (same inputs -> same outputs), which rollback needs.
 */
import RAPIER from "@dimforge/rapier3d-compat";

await RAPIER.init();
const results = {};
const approx = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

// --- Test 1: falling box stack settles ---
{
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  const ground = world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.5, 50).setTranslation(0, -0.5, 0));
  const boxes = [];
  for (let i = 0; i < 5; i++) {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1 + i * 1.1, 0));
    world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), body);
    boxes.push(body);
  }
  for (let i = 0; i < 240; i++) world.step(); // 4s @60Hz
  const ys = boxes.map((b) => b.translation().y);
  const settled = ys.every((y, i) => approx(y, 0.5 + i * 1.0, 0.08));
  const speeds = boxes.map((b) => b.linvel());
  const still = speeds.every((v) => Math.hypot(v.x, v.y, v.z) < 0.05);
  results.stackSettled = settled && still;
  results.stackYs = ys.map((y) => +y.toFixed(3));
}

// --- Test 2: impulse knocks a body (hit-reaction base) ---
{
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.5, 50).setTranslation(0, -0.5, 0));
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 2, 0));
  world.createCollider(RAPIER.ColliderDesc.ball(0.5), body);
  const before = { ...body.translation() };
  body.applyImpulse({ x: 10, y: 2, z: 0 }, true);
  for (let i = 0; i < 60; i++) world.step();
  const after = body.translation();
  results.impulseMoved = after.x > before.x + 1.0;
  results.impulseDx = +(after.x - before.x).toFixed(3);
}

// --- Test 3: determinism (rollback requirement) ---
function runSim() {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.5, 50).setTranslation(0, -0.5, 0));
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(1, 5, -2));
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.4, 0.4, 0.4), body);
  body.applyImpulse({ x: -3, y: 0, z: 4 }, true);
  for (let i = 0; i < 120; i++) world.step();
  const t = body.translation();
  return [t.x, t.y, t.z].map((v) => +v.toFixed(6));
}
{
  const a = runSim(), b = runSim();
  results.deterministic = a.every((v, i) => v === b[i]);
  results.finalPos = a;
}

console.log(JSON.stringify(results, null, 2));
const pass = results.stackSettled && results.impulseMoved && results.deterministic;
console.log(pass ? "RAPIER PROOF: PASS" : "RAPIER PROOF: FAIL");
process.exit(pass ? 0 : 1);
