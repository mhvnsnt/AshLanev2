/**
 * UR-feel 5/5 tests: telegraphed cheap shots from behind.
 * Run: node --experimental-strip-types --loader /tmp/ts-resolve-loader.mjs --test src/game3d/ur-feel-5.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSim, step, type FrameInput } from "./sim.ts";

const DT = 1 / 60;
const IDLE: FrameInput = { x: 0, y: 0, attack: false, grab: false, blast: false, jump: false, dash: false, use: false };

function setup() {
  const sim = createSim();
  sim.running = true;
  sim.hitstop = 0;
  sim.streetClear = true;
  sim.scuffle = "plaza";
  const p = sim.bodies[0];
  const grunt = sim.bodies.find((b) => b.kind === "grunt" && b.alive)!;
  sim.bodies = [p, grunt];
  // Player at origin facing +x (yaw = -PI/2 gives forward +x).
  p.x = 0; p.z = 0; p.y = 0;
  p.yaw = -Math.PI / 2; // forward(+x)
  p.hp = 100; p.alive = true; p.state = "free"; p.stateT = 0;
  p.iframe = 0; p.vx = 0; p.vz = 0; p.grounded = true;
  // Grunt BEHIND the player (at -x, player faces +x), within attack range.
  grunt.x = -1.2; grunt.z = 0; grunt.y = 0;
  grunt.hp = 60; grunt.alive = true; grunt.state = "free"; grunt.stateT = 0;
  grunt.iframe = 0; grunt.cd = 0; grunt.vx = 0; grunt.vz = 0;
  grunt.yaw = Math.PI / 2;
  return { sim, p, grunt };
}

test("cheapshot: attacker behind the player telegraphs before striking", () => {
  const { sim, p, grunt } = setup();
  // Force the brain to want an attack by running steps until it triggers.
  // (50% chance per attack intent; run enough steps to be deterministic.)
  let telegraphed = false;
  for (let i = 0; i < 600 && !telegraphed; i++) {
    step(sim, IDLE, DT);
    if (grunt.state === "cheapshot") telegraphed = true;
    // Keep the grunt in range and behind the player.
    if (grunt.state === "free") {
      grunt.x = -1.2; grunt.z = 0;
      p.yaw = -Math.PI / 2;
    }
  }
  assert.ok(telegraphed, "grunt behind player should enter cheapshot telegraph");
  assert.equal(sim.banner, "Behind you!", "expected 'Behind you!' warning");
  assert.ok(sim.sfx.includes("warn"), "warning sfx should play");
});

test("cheapshot: telegraph expires into a fast attack", () => {
  const { sim, grunt } = setup();
  // Manually enter the telegraph.
  grunt.state = "cheapshot";
  grunt.stateT = 0.05;
  grunt.yaw = Math.PI / 2;
  sim.group.activeAttackers = [grunt.id];
  step(sim, IDLE, DT);
  step(sim, IDLE, DT);
  step(sim, IDLE, DT);
  step(sim, IDLE, DT);
  assert.equal(grunt.state, "atk", "cheapshot should launch into atk, got " + grunt.state);
  assert.equal(grunt.swing, 6, "cheap shot should be marked (swing=6)");
});
