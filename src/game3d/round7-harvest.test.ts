/**
 * Round 7 wiring tests: deterministic-rng (seedrandom) + netcode-codec
 * (@msgpack/msgpack) + saves.ts compressed export (fflate).
 * Run: node --experimental-strip-types --test src/game3d/round7-harvest.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createRng,
  SimRandom,
  hashString,
  runSyncTest,
  poisonMathRandom,
  restoreMathRandom,
  isMathRandomPoisoned,
} from "./deterministic-rng.ts";
import {
  DIR,
  BTN,
  REDUNDANT_FRAMES,
  encodeInputStream,
  decodeInputStream,
  makeInputPacket,
  makeMask,
  inputMaskToString,
  type InputFrame,
} from "./netcode-codec.ts";
import {
  DEFAULT_SAVE,
  exportSaveCompressed,
  importSaveCompressed,
  type GameSaveV2,
} from "./saves.ts";

// ---------- deterministic-rng ----------

test("createRng: same seed -> identical stream", () => {
  const a = createRng("ashlane-match-42");
  const b = createRng("ashlane-match-42");
  for (let i = 0; i < 50; i++) assert.equal(a(), b());
});

test("createRng: different seeds -> different streams", () => {
  const a = createRng("seed-a");
  const b = createRng("seed-b");
  let differs = false;
  for (let i = 0; i < 10; i++) if (a() !== b()) differs = true;
  assert.ok(differs, "different seeds must diverge");
});

test("SimRandom: helpers stay in range", () => {
  const rng = new SimRandom(1234);
  for (let i = 0; i < 100; i++) {
    const v = rng.int(1, 6);
    assert.ok(v >= 1 && v <= 6, `int out of range: ${v}`);
    assert.ok(rng.pick(["a", "b", "c"]).length === 1);
    assert.equal(typeof rng.chance(0.5), "boolean");
  }
  assert.throws(() => rng.pick([]), /empty array/);
});

test("SimRandom: state save/restore resumes identical stream (rollback snapshot)", () => {
  const rng = new SimRandom("rollback-test");
  const seen: number[] = [];
  for (let i = 0; i < 5; i++) seen.push(rng.next());
  const snapshot = rng.state();
  const after: number[] = [];
  for (let i = 0; i < 5; i++) after.push(rng.next());
  // Rewind: restore snapshot, replay — must reproduce `after` exactly.
  rng.restore(snapshot);
  for (let i = 0; i < 5; i++) assert.equal(rng.next(), after[i]);
});

test("SimRandom: fork reproduces the original stream", () => {
  const rng = new SimRandom("fork-test");
  const fork = rng.fork();
  for (let i = 0; i < 20; i++) assert.equal(rng.next(), fork.next());
});

test("runSyncTest: deterministic mock sim passes Phase-0 check", () => {
  // Mock fight sim: two fighters, positions driven ONLY by the seeded rng.
  const result = runSyncTest("match-seed", 600, (rng, tick) => {
    const p1x = Math.floor(rng.next() * 1000);
    const p2x = Math.floor(rng.next() * 1000);
    const hp = 100 - rng.int(0, tick % 7);
    return hashString(`${p1x},${p2x},${hp}`);
  });
  assert.ok(result.match, `SyncTest failed: ${result.checksums.join(" vs ")}`);
  assert.equal(result.ticks, 600);
});

test("runSyncTest: detects a nondeterministic sim (wall-clock leak)", () => {
  let counter = 0;
  const result = runSyncTest("seed", 10, () => counter++);
  assert.ok(!result.match, "counter-based sim must NOT match across runs");
});

test("poisonMathRandom: Math.random throws inside the sim, restores cleanly", () => {
  assert.equal(isMathRandomPoisoned(), false);
  poisonMathRandom();
  assert.equal(isMathRandomPoisoned(), true);
  assert.throws(() => Math.random(), /deterministic sim/);
  // The seeded RNG keeps working while Math.random is poisoned.
  const rng = createRng("poison-proof");
  assert.ok(rng() >= 0 && rng() < 1);
  restoreMathRandom();
  assert.equal(isMathRandomPoisoned(), false);
  assert.ok(Math.random() >= 0 && Math.random() < 1);
});

// ---------- netcode-codec ----------

function mkFrames(n: number): InputFrame[] {
  const frames: InputFrame[] = [];
  for (let tick = 0; tick < n; tick++) {
    frames.push({
      tick,
      p1: makeMask(DIR.E, tick % 3 === 0 ? BTN.PUNCH : 0),
      p2: makeMask(tick % 2 ? DIR.W : DIR.NW, tick % 5 === 0 ? BTN.KICK | BTN.BLOCK : 0),
    });
  }
  return frames;
}

test("netcode-codec: 60-frame roundtrip preserves ticks and masks", () => {
  const frames = mkFrames(60);
  const bytes = encodeInputStream(frames);
  assert.ok(bytes instanceof Uint8Array);
  const back = decodeInputStream(bytes);
  assert.equal(back.length, 60);
  for (let i = 0; i < 60; i++) {
    assert.deepEqual(back[i], frames[i]);
  }
});

test("netcode-codec: msgpack is smaller than JSON for an input stream", () => {
  const frames = mkFrames(60);
  const packed = encodeInputStream(frames).length;
  const json = new TextEncoder().encode(JSON.stringify(frames)).length;
  assert.ok(packed < json, `msgpack ${packed} should beat JSON ${json}`);
});

test("netcode-codec: makeInputPacket carries only the redundant tail", () => {
  const frames = mkFrames(60);
  const packet = decodeInputStream(makeInputPacket(frames));
  assert.equal(packet.length, REDUNDANT_FRAMES);
  assert.equal(packet[0].tick, 60 - REDUNDANT_FRAMES);
  assert.equal(packet[packet.length - 1].tick, 59);
});

test("netcode-codec: rejects out-of-range masks and bad ticks", () => {
  assert.throws(() => encodeInputStream([{ tick: 0, p1: 0x10000, p2: 0 }]), /16-bit/);
  assert.throws(() => encodeInputStream([{ tick: 0, p1: -1, p2: 0 }]), /16-bit/);
  assert.throws(() => encodeInputStream([{ tick: -1, p1: 0, p2: 0 }]), /bad tick/);
  // Truncated msgpack bytes: the msgpack decoder itself rejects them.
  assert.throws(() => decodeInputStream(new Uint8Array([0x93, 0x01])), /./);
});

test("netcode-codec: inputMaskToString is human-readable", () => {
  assert.equal(inputMaskToString(makeMask(DIR.E, BTN.PUNCH)), "E+PUNCH");
  assert.equal(inputMaskToString(0), "—");
  assert.equal(
    inputMaskToString(makeMask(DIR.NW, BTN.KICK | BTN.BLOCK)),
    "NW+KICK+BLOCK",
  );
});

// ---------- saves.ts compressed export (fflate) ----------

function bigSave(): GameSaveV2 {
  return {
    ...DEFAULT_SAVE,
    playerName: "Round7 Tester",
    unlockedFighters: Array.from({ length: 24 }, (_, i) => `fighter-${i}`),
    unlockedStages: Array.from({ length: 12 }, (_, i) => `stage-${i}`),
    campaign: { chapter: 5, completed: Array.from({ length: 40 }, (_, i) => `m${i}`) },
    records: { wins: 137, losses: 42, kos: 89 },
  };
}

test("saves: exportSaveCompressed -> importSaveCompressed roundtrip", async () => {
  const save = bigSave();
  const bytes = await exportSaveCompressed(save);
  assert.ok(bytes instanceof Uint8Array);
  // gzip magic when fflate is installed
  assert.equal(bytes[0], 0x1f);
  assert.equal(bytes[1], 0x8b);
  const back = await importSaveCompressed(bytes);
  assert.deepEqual(back.save, save);
  assert.equal(typeof back.exportedAt, "number");
});

test("saves: compressed bytes are smaller than raw JSON", async () => {
  const save = bigSave();
  const bytes = await exportSaveCompressed(save);
  const jsonLen = new TextEncoder().encode(JSON.stringify({ exportedAt: 0, save })).length;
  assert.ok(bytes.length < jsonLen, `gzip ${bytes.length} should beat JSON ${jsonLen}`);
});

test("saves: importSaveCompressed accepts raw JSON bytes (fflate fallback form)", async () => {
  const save = bigSave();
  const raw = new TextEncoder().encode(JSON.stringify({ exportedAt: 123, save }));
  assert.ok(raw[0] !== 0x1f, "test sanity: raw JSON must not look gzipped");
  const back = await importSaveCompressed(raw);
  assert.deepEqual(back.save, save);
  assert.equal(back.exportedAt, 123);
});

test("saves: importSaveCompressed rejects corrupt data", async () => {
  await assert.rejects(
    importSaveCompressed(new TextEncoder().encode("{not json")),
    /corrupt/,
  );
  // gzip magic but garbage payload
  await assert.rejects(
    importSaveCompressed(new Uint8Array([0x1f, 0x8b, 0x00, 0x01, 0x02])),
    /corrupt/,
  );
});
