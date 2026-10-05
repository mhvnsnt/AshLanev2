import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import testRunner from "node:test";

const [rosterSource, stylesSource, pipelineSource] = await Promise.all([
  readFile(new URL("../src/game3d/roster.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/game3d/styles.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/game3d/rig-pipeline.ts", import.meta.url), "utf8"),
]);

testRunner("every roster martial style has a selectable profile", () => {
  const rosterMartials = new Set(
    [...rosterSource.matchAll(/martial:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
  const martialBlock = stylesSource.match(/export const MARTIAL:[\s\S]*?\n\];/)?.[0] ?? "";
  const profileIds = new Set(
    [...martialBlock.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
  assert.ok(martialBlock, "MARTIAL profile table must exist");
  assert.deepEqual(
    [...rosterMartials].filter((id) => !profileIds.has(id)),
    [],
    "every roster martial id must resolve to a profile",
  );
});

testRunner("martial profiles reference known UAL/bank clip names", async () => {
  const martialBlock = stylesSource.match(/export const MARTIAL:[\s\S]*?\n\];/)?.[0] ?? "";
  const clipBlock = pipelineSource.match(/export const CLIP_NAMES = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const known = new Set([...clipBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]));
  const refs = [...martialBlock.matchAll(/(?:idle|walk|run|back|strafeL|strafeR|jump|fall|jab|cross|launch|sweep|lunge|armedJab|armedCross|armedLaunch|armedSweep|armedLunge|spin|hit|dodge|down|death|pickup|throw|grab|block|cheer):\s*"([^"]+)"/g)]
    .map((match) => match[1]);
  assert.ok(refs.length > 0, "martial profile table must contain clip mappings");
  assert.deepEqual([...new Set(refs)].filter((name) => !known.has(name)), []);
});
