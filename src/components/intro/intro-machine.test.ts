import { test } from "node:test";
import assert from "node:assert/strict";
import { introNext, introDone, type IntroState } from "./intro-machine.ts";

test("tap gate advances to checking", () => {
  assert.equal(introNext("tap", { type: "TAP" }), "checking");
});

test("tap gate ignores everything except TAP", () => {
  const s: IntroState = "tap";
  assert.equal(introNext(s, { type: "SKIP" }), "tap");
  assert.equal(introNext(s, { type: "VIDEO_FOUND" }), "tap");
});

test("found video plays, missing video falls through to app", () => {
  assert.equal(introNext("checking", { type: "VIDEO_FOUND" }), "video");
  assert.equal(introNext("checking", { type: "VIDEO_MISSING" }), "app");
});

test("video ends, skip, or error all hand off to app", () => {
  assert.equal(introNext("video", { type: "VIDEO_ENDED" }), "app");
  assert.equal(introNext("video", { type: "SKIP" }), "app");
  assert.equal(introNext("video", { type: "VIDEO_ERROR" }), "app");
});

test("app is terminal", () => {
  assert.equal(introNext("app", { type: "TAP" }), "app");
  assert.equal(introNext("app", { type: "SKIP" }), "app");
});

test("full happy path: tap -> checking -> video -> app", () => {
  let s: IntroState = "tap";
  s = introNext(s, { type: "TAP" });
  s = introNext(s, { type: "VIDEO_FOUND" });
  s = introNext(s, { type: "VIDEO_ENDED" });
  assert.equal(s, "app");
  assert.ok(introDone(s));
});

test("missing-video fallback path: tap -> checking -> app (never stuck)", () => {
  let s: IntroState = "tap";
  s = introNext(s, { type: "TAP" });
  s = introNext(s, { type: "VIDEO_MISSING" });
  assert.equal(s, "app");
  assert.ok(introDone(s));
});

test("skip path: tap -> checking -> video -> skip -> app", () => {
  let s: IntroState = "tap";
  s = introNext(s, { type: "TAP" });
  s = introNext(s, { type: "VIDEO_FOUND" });
  s = introNext(s, { type: "SKIP" });
  assert.equal(s, "app");
});
