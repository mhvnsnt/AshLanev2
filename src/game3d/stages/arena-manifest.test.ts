/**
 * Arena manifest validation.
 * Run: node --experimental-strip-types --test src/game3d/stages/arena-manifest.test.ts
 *
 * Guards: 51 unique ids, every artReady entry has a real thumbnail in
 * public/stages/arenas/, districts/skies/looks are all known keys, no
 * invented canon text (no faction names, no character names), hooks present.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARENA_MANIFEST,
  CROWD_ARENA_IDS,
  getArena,
  getArenasByDistrict,
  getPendingArenas,
  getSelectableArenas,
  getVersusArenas,
} from "./arena-manifest.ts";
import type { CityDistrictId } from "../city/districts.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");

const DISTRICTS = new Set<CityDistrictId>([
  "neon-district", "marquee-mile", "civic", "projects", "industrial",
  "waterfront", "underground", "outskirts", "suburbs",
]);
const SKIES = new Set(["alleys", "strip", "warehouses", "subway", "rooftops", "park"]);
const LOOKS = new Set(["ward", "dock", "pit", "high", "yard", "under"]);
// Names that must never appear unprompted in arena copy (people /
// companies from other canon — JPCW, Combine, Authority, and Hollows ARE
// canon and referenced legitimately in this manifest).
const FORBIDDEN = ["kennedy", "combs", "awe", "stick-up", "finxsse"];

test("manifest has 51 entries with unique ids", () => {
  assert.equal(ARENA_MANIFEST.length, 51);
  const ids = ARENA_MANIFEST.map((a) => a.id);
  assert.equal(new Set(ids).size, 51);
});

test("every artReady arena has a real thumbnail in public/stages/arenas/", () => {
  for (const a of ARENA_MANIFEST) {
    if (!a.artReady) continue;
    const p = join(repo, "public", a.art);
    assert.ok(existsSync(p), `missing thumbnail: ${a.art}`);
    assert.ok(statSync(p).size > 10_000, `thumbnail too small: ${a.art}`);
    assert.equal(a.art, `stages/arenas/${a.id}.webp`, `art path must match id for ${a.id}`);
  }
});

test("selectable/versus/pending selectors are consistent", () => {
  const ready = ARENA_MANIFEST.filter((a) => a.artReady);
  assert.equal(getSelectableArenas().length, ready.length);
  assert.equal(getVersusArenas().length, ready.filter((a) => a.versus).length);
  assert.equal(getPendingArenas().length, ARENA_MANIFEST.length - ready.length);
});

test("getArena resolves by id and returns undefined for legacy ids", () => {
  assert.equal(getArena("arena-ring-square")?.name, "RING SQUARE");
  assert.equal(getArena("ward"), undefined);
});

test("districts, skies, and looks are all known keys", () => {
  for (const a of ARENA_MANIFEST) {
    assert.ok(DISTRICTS.has(a.district), `bad district ${a.district} on ${a.id}`);
    assert.ok(SKIES.has(a.sky), `bad sky ${a.sky} on ${a.id}`);
    assert.ok(LOOKS.has(a.lookLike), `bad lookLike ${a.lookLike} on ${a.id}`);
  }
});

test("every district anchors at least one arena", () => {
  for (const d of DISTRICTS) {
    assert.ok(getArenasByDistrict(d).length > 0, `no arenas anchored to ${d}`);
  }
});

test("crowd arenas are a subset of the manifest", () => {
  for (const id of CROWD_ARENA_IDS) {
    assert.ok(getArena(id), `crowd id not in manifest: ${id}`);
  }
});

test("no invented canon in names, blurbs, or hooks", () => {
  for (const a of ARENA_MANIFEST) {
    const text = `${a.name} ${a.blurb} ${a.hook}`.toLowerCase();
    for (const word of FORBIDDEN) {
      assert.ok(!text.includes(word), `${a.id} invents canon: "${word}"`);
    }
    assert.ok(a.hook.length > 10, `${a.id} missing story hook`);
    assert.ok(a.area.length > 0, `${a.id} missing area label`);
  }
});
