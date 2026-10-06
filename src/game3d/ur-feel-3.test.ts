/**
 * UR-feel 3/5 tests: reversals (dash-with-the-punch) + grab escapes (mash out).
 * Run: node --experimental-strip-types --test src/game3d/ur-feel-3.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSim, step, type FrameInput } from "./sim.ts";

const DT = 1 / 60;
const IDLE: FrameInput = { x: 0, y: 0, attack: false, grab: false, blast: false, jump: false, dash: false, use: false };
const ATK: FrameInput = { ...IDLE, attack: true };

function setup() {
  const sim = createSim();
  sim.running = true;
  sim.hitstop = 0;
  sim.streetClear = true; // prevent "Gate's open" banner overwriting test banners
  sim.scuffle = "plaza"; // prevent "Scuffle" banner overwriting test banners
  const p = sim.bodies[0];
  // Clear all grunts except one brute placed near the player.
  const brute = sim.bodies.find((b) => b.kind === "grunt" && b.arch === "brute")!;
  sim.bodies = [p, brute];
  p.x = 0; p.z = 0; p.y = 0;
  p.hp = 100; p.alive = true; p.state = "free"; p.stateT = 0;
  p.iframe = 0; p.vx = 0; p.vz = 0;
  brute.x = 1.0; brute.z = 0; brute.y = 0;
  brute.hp = 60; brute.alive = true; brute.state = "free"; brute.stateT = 0;
  brute.iframe = 0; brute.cd = 0; brute.vx = 0; brute.vz = 0;
  return { sim, p, brute };
}

test("reversal: dashing with the punch reverses the attacker", () => {
  const { sim, p, brute } = setup();
  // Brute winds up and swings at the player (facing -x toward player at origin).
  brute.yaw = Math.atan2(-(0 - 1.0), 0 - 0); // face the player
  brute.state = "atk";
  brute.stateT = 0.1; // < 0.14 so the hit connects this step
  brute.swung = false;
  brute.swing = 0;
  // Player dashes WITH the punch direction (-x, same as knockback).
  p.state = "dash";
  p.stateT = 0.2;
  p.vx = -6; p.vz = 0;
  const hpBefore = brute.hp;
  step(sim, IDLE, DT);
  assert.equal(sim.banner, "Reversal!", "expected Reversal! banner, got " + sim.banner);
  assert.equal(brute.state, "launch", "brute should be launched");
  assert.ok(brute.hp < hpBefore, "brute should take the reversed damage");
  assert.ok(sim.dodgeChain >= 1, "dodge chain should increment");
});

test("grab escape: mashing attack breaks a brute grab", () => {
  const { sim, p, brute } = setup();
  // Manually enter the grab struggle.
  brute.state = "grab";
  brute.stateT = 1.7;
  p.state = "grab";
  p.stateT = 1.7;
  p.grabMash = 0;
  sim.foeGrab = brute.id;
  // Mash attack until escape (0.34 per mash, need 1.0).
  let escaped = false;
  for (let i = 0; i < 6 && !escaped; i++) {
    step(sim, ATK, DT);
    if (sim.banner === "Grab escape!") escaped = true;
    else step(sim, IDLE, DT);
  }
  assert.ok(escaped, "player should escape the grab by mashing");
  assert.equal(p.state, "free", "player should break free, got " + p.state);
  assert.equal(sim.banner, "Grab escape!", "expected Grab escape! banner, got " + sim.banner);
  assert.equal(sim.foeGrab, -1, "foeGrab should clear");
  assert.equal(brute.state, "hit", "brute should be staggered");
});

test("grab struggle lost: timer expiry slams the player", () => {
  const { sim, p, brute } = setup();
  brute.state = "grab";
  brute.stateT = 1.7;
  p.state = "grab";
  p.stateT = 0.05; // almost out of time
  p.grabMash = 0;
  p.hp = 100;
  sim.foeGrab = brute.id;
  // Don't mash — let the timer expire.
  for (let i = 0; i < 10; i++) step(sim, IDLE, DT);
  assert.ok(p.hp < 100, "player should take slam damage");
  assert.equal(sim.foeGrab, -1, "foeGrab should clear after slam");
});
