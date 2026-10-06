// dev-hooks.test-run.mjs — logic-level proof for src/game3d/dev-hooks.ts.
// Run: node --experimental-strip-types tools/hands/dev-hooks.test-run.mjs
// Stubs window/location, imports the REAL dev-hooks module, drives it with a
// mock sim + mock Handle, and asserts the control surface behaves.
import assert from "node:assert";

// --- browser shims (must exist before the game modules load) ---
globalThis.window = globalThis;
globalThis.location = { search: "?debug=1&autostart=bout&kind=exhibit&stage=ward&who=sombra_negra" };
globalThis.localStorage = { _m: new Map(), getItem(k) { return this._m.get(k) ?? null; }, setItem(k, v) { this._m.set(k, String(v)); }, removeItem(k) { this._m.delete(k); } };
globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {} };
if (!globalThis.requestAnimationFrame) globalThis.requestAnimationFrame = () => 0;

const { installDevHooks, devHooksEnabled, readHookParams } = await import("../../src/game3d/dev-hooks.ts");

assert.equal(devHooksEnabled(), true, "debug=1 should enable hooks");
assert.deepEqual(readHookParams(), {
  autostart: "bout", kind: "exhibit", stage: "ward", who: "sombra_negra", debug: "1",
});

// --- mock sim (only the fields dev-hooks touches) ---
const calls = [];
const sim = {
  bodies: [
    { id: 0, kind: "player", name: "Test", x: 1, y: 0, z: 2, yaw: 0.5, hp: 88, maxHp: 100, state: "free", stateT: 1.2 },
    { id: 1, kind: "grunt", name: "Goon", x: -3, y: 0, z: 1, yaw: -0.2, hp: 40, maxHp: 50, state: "free", stateT: 0 },
  ],
  orbit: 0, camYaw: 0, running: true, paused: false, mode: "belt",
  tune: {}, combo: 0, foes: 1, banner: "", splash: "", meter: 0,
};
const handle = new Proxy({}, {
  get: (_t, prop) => (...a) => { calls.push([prop, ...a]); return undefined; },
});

installDevHooks(sim, handle);
const h = globalThis.__ashlane;
assert.ok(h, "window.__ashlane installed");
assert.equal(h.version, "dev-hooks/2026-10-06");

// fighters() mapping
const fs = h.fighters();
assert.equal(fs.length, 2);
assert.deepEqual(fs[0], { id: 0, kind: "player", name: "Test", x: 1, y: 0, z: 2, yaw: 0.5, hp: 88, maxHp: 100, state: "free", stateT: 1.2 });

// camera / teleport mutate the sim
h.camera(1.2);
assert.equal(sim.orbit, 1.2);
assert.equal(sim.camYaw, 1.2);
h.teleport(1, 10, -10);
assert.equal(sim.bodies[1].x, 10);
assert.equal(sim.bodies[1].z, -10);
assert.throws(() => h.teleport(9, 0, 0), /no body at index 9/);

// roster() comes from the real roster.ts
const roster = h.roster();
assert.ok(roster.length > 10, "roster non-empty");
assert.ok(roster.some((r) => r.id === "sombra_negra"), "sombra_negra in roster");

// handle passthroughs
h.setStick(0, -1); h.press("attack"); h.setWho("sombra_negra"); h.pause(true);
assert.deepEqual(calls.filter((c) => c[0] === "setStick"), [["setStick", 0, -1]]);
assert.ok(calls.some((c) => c[0] === "setBtn" && c[1] === "attack" && c[2] === true), "press() pushes setBtn down");
assert.ok(calls.some((c) => c[0] === "setWho" && c[1] === "sombra_negra"));
assert.throws(() => h.setWho("nope-not-a-fighter"), "setWho throws on unknown id");

// autostart params applied via the queued handle calls (setTimeout 1200ms)
await new Promise((r) => setTimeout(r, 1600));
assert.ok(calls.some((c) => c[0] === "setWho" && c[1] === "sombra_negra"), "autostart applied setWho");
assert.ok(calls.some((c) => c[0] === "startBout" && c[1] === "exhibit" && c[2] === "ward"), "autostart applied startBout");

console.log("dev-hooks logic test: ALL ASSERTIONS PASSED");
console.log("  roster size:", roster.length, "| handle calls:", calls.length);
