/**
 * UR-feel 4/5 tests: wall-aimed throws (deliberate wall slams).
 * Run: node --experimental-strip-types --loader /tmp/ts-resolve-loader.mjs --test src/game3d/ur-feel-4.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSim, step, type FrameInput } from "./sim.ts";

const DT = 1 / 60;
const IDLE: FrameInput = { x: 0, y: 0, attack: false, grab: false, blast: false, jump: false, dash: false, use: false };
const GRAB: FrameInput = { ...IDLE, grab: true };
const GRAB_AIM_X: FrameInput = { ...IDLE, grab: true, x: 0.3, y: 0 }; // gentle +x aim (avoids Whip variant)

function setup() {
  const sim = createSim();
  sim.running = true;
  sim.hitstop = 0;
  sim.streetClear = true;
  sim.scuffle = "plaza";
  const p = sim.bodies[0];
  const grunt = sim.bodies.find((b) => b.kind === "grunt" && b.alive)!;
  sim.bodies = [p, grunt];
  p.x = 0; p.z = 0; p.y = 0;
  p.hp = 100; p.alive = true; p.state = "grab"; p.stateT = 1;
  p.iframe = 0; p.vx = 0; p.vz = 0;
  grunt.x = 1.0; grunt.z = 0; grunt.y = 0;
  grunt.hp = 60; grunt.alive = true; grunt.state = "grab"; grunt.stateT = 1;
  grunt.iframe = 0; grunt.vx = 0; grunt.vz = 0;
  sim.grabId = grunt.id;
  sim.lockArm = 0;
  sim.pairT = 0;
  // Aim the throw toward +x via input (aim is recomputed from input each frame).
  sim.aimX = 1; sim.aimZ = 0;
  return { sim, p, grunt };
}

test("wall aim: throw toward a nearby wall steers into it", () => {
  const { sim, grunt } = setup();
  // Place a wall 4m in the throw direction (+x from the grunt at x=1).
  sim.boxes.push({
    kind: "wall", role: "", minX: 4.5, maxX: 5.5, minZ: -1, maxZ: 1, minY: 0, maxY: 3,
  } as any);
  step(sim, GRAB_AIM_X, DT);
  assert.equal(grunt.state, "throw", "grunt should be thrown, got " + grunt.state);
  // wallAimed is consumed by wallSlam, but the velocity should be boosted/steered.
  const speed = Math.hypot(grunt.vx, grunt.vz);
  assert.ok(speed > 7, "throw should be boosted toward the wall, speed=" + speed.toFixed(2));
  assert.ok(grunt.vx > 0, "throw should head +x toward the wall");
});

test("no wall: throw without a wall in path is unmodified", () => {
  const { sim, grunt } = setup();
  // No wall added — throw into empty space.
  step(sim, GRAB, DT);
  assert.equal(grunt.state, "throw", "grunt should be thrown");
  assert.equal(grunt.wallAimed, false, "wallAimed should be false with no wall");
});
