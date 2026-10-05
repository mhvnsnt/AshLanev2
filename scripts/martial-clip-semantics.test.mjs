import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import testRunner from "node:test";

const stylesSource = await readFile(new URL("../src/game3d/styles.ts", import.meta.url), "utf8");
const martialBlock = stylesSource.match(/export const MARTIAL:[\s\S]*?\n\];/)?.[0] ?? "";
const attackSlots = new Set(["jab", "cross", "launch", "sweep", "lunge", "spin"]);

testRunner("martial attack slots never play locomotion, dodge, jump, interaction, or pickup clips", () => {
  assert.ok(martialBlock, "MARTIAL profile table must exist");
  const badMappings = [];
  const profiles = martialBlock.split(/(?=\n  \{\n    id: )/).filter((block) => /\bid:\s*"/.test(block));
  for (const profile of profiles) {
    const id = profile.match(/\bid:\s*"([^"]+)"/)?.[1] ?? "unknown";
    const clipsBlock = profile.match(/clips:\s*\{([\s\S]*?)\n    \}/)?.[1] ?? "";
    for (const match of clipsBlock.matchAll(/(\w+):\s*"([^"]+)"/g)) {
      const [, slot, clip] = match;
      if (attackSlots.has(slot) && !clip.includes("Melee_Attack")) {
        badMappings.push(id + "." + slot + " -> " + clip);
      }
    }
  }
  assert.deepEqual(
    badMappings,
    [],
    "Attack slots must use an attack animation; utility/locomotion clips belong in their own slots.",
  );
});
