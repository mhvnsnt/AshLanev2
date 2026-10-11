/**
 * UI art manifest validation.
 * Run: node --experimental-strip-types --test src/game3d/ui-art.test.ts
 *
 * Guards: every UI_ART key resolves to a real file in public/ui/,
 * every EMBLEMS entry resolves to a real file in public/emblems/,
 * ids unique, generics stay generic, no invented canon names,
 * no banned words ("gang" for Onyx's crew, "Corporate Authority", "The Painted").
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  UI_ART,
  EMBLEMS,
  getEmblem,
  getCanonEmblems,
  getGenericEmblems,
} from "./ui-art.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");

test("every UI_ART entry has a real asset in public/ui/", () => {
  const keys = Object.keys(UI_ART);
  assert.ok(keys.length >= 100, `expected 100+ UI assets, got ${keys.length}`);
  for (const key of keys) {
    const art = UI_ART[key as keyof typeof UI_ART];
    const p = join(repo, "public", art);
    assert.ok(existsSync(p), `missing UI asset: ${art}`);
    assert.ok(statSync(p).size > 2_000, `UI asset too small: ${art}`);
  }
});

test("UI_ART paths follow the ui/<key>.webp convention", () => {
  for (const key of Object.keys(UI_ART)) {
    const art = UI_ART[key as keyof typeof UI_ART];
    assert.equal(art, `ui/${key}.webp`, `path must match key for ${key}`);
  }
});

test("emblems: 38 entries, unique ids, real files", () => {
  assert.equal(EMBLEMS.length, 38);
  const ids = EMBLEMS.map((e) => e.id);
  assert.equal(new Set(ids).size, 38);
  for (const e of EMBLEMS) {
    const p = join(repo, "public", e.art);
    assert.ok(existsSync(p), `missing emblem: ${e.art}`);
    assert.ok(statSync(p).size > 5_000, `emblem too small: ${e.art}`);
    assert.equal(e.art, `emblems/emblem-${e.id}.webp`, `art must match id for ${e.id}`);
  }
});

test("emblems: 32 canon + 6 generic", () => {
  assert.equal(getCanonEmblems().length, 32);
  assert.equal(getGenericEmblems().length, 6);
  for (const g of getGenericEmblems()) {
    assert.ok(g.name.startsWith("Generic"), `generic must be labeled Generic: ${g.id}`);
  }
});

test("getEmblem resolves known factions", () => {
  assert.equal(getEmblem("ashes")?.name, "The Ashes");
  assert.equal(getEmblem("onyx-crew")?.name, "Onyx's Crew");
  assert.equal(getEmblem("pit-jack-slade")?.name, "The Pit (Jack Slade)");
  assert.equal(getEmblem("nope"), undefined);
});

test("no invented canon or banned words in emblem names", () => {
  const names = EMBLEMS.map((e) => e.name.toLowerCase()).join(" | ");
  assert.ok(!names.includes("the painted"), "never use 'The Painted'");
  assert.ok(!names.includes("corporate authority"), "'Corporate Authority' does not exist");
  for (const e of EMBLEMS) {
    assert.ok(!/\bgang\b/.test(e.name.toLowerCase()), `never 'gang': ${e.id}`);
  }
});

test("both Pits exist as distinct emblems", () => {
  assert.ok(getEmblem("pit"), "pit emblem");
  assert.ok(getEmblem("pit-jack-slade"), "pit-jack-slade emblem");
  assert.notEqual(getEmblem("pit")!.art, getEmblem("pit-jack-slade")!.art);
});
