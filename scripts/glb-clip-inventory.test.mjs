import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import testRunner from "node:test";

const root = resolve(".");
const publicRoot = join(root, "public");
const rosterText = readFileSync(join(root, "src/game3d/roster.ts"), "utf8");
const stylesText = readFileSync(join(root, "src/game3d/styles.ts"), "utf8");
const pipelineText = readFileSync(join(root, "src/game3d/rig-pipeline.ts"), "utf8");
const martialBlock = stylesText.match(/export const MARTIAL:[\s\S]*?\n\];/)?.[0] ?? "";
const slotNames = "idle walk run back strafeL strafeR jump fall jab cross launch sweep lunge armedJab armedCross armedLaunch armedSweep armedLunge spin hit dodge down death pickup throw grab block cheer".split(" ");
const mappedClips = [...new Set(
  [...martialBlock.matchAll(new RegExp(`(?:${slotNames.join("|")}):\\s*"([^"]+)"`, "g"))].map((match) => match[1]),
)];

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function parseGlbJson(file) {
  const bytes = readFileSync(file);
  if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "glTF") return null;
  if (bytes.readUInt32LE(4) !== 2) return null;
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32LE(offset);
    const type = bytes.readUInt32LE(offset + 4);
    offset += 8;
    if (length < 0 || offset + length > bytes.length) return null;
    if (type === 0x4e4f534a) {
      return JSON.parse(bytes.toString("utf8", offset, offset + length).replace(/\0+$/g, "").trim());
    }
    offset += length;
  }
  return null;
}

const glbFiles = walk(join(publicRoot, "models")).filter((file) => file.toLowerCase().endsWith(".glb"));
const embeddedAnimations = new Set();
const readableGlbs = [];
const glbsWithAnimations = [];
for (const file of glbFiles) {
  try {
    const gltf = parseGlbJson(file);
    if (!gltf) continue;
    readableGlbs.push(file);
    const animations = Array.isArray(gltf.animations) ? gltf.animations : [];
    if (animations.length) glbsWithAnimations.push({ file, count: animations.length });
    for (const animation of animations) if (animation?.name) embeddedAnimations.add(animation.name);
  } catch {
    // Inventory should keep scanning; a separate model audit owns malformed-file reporting.
  }
}

const ualPath = join(publicRoot, "motion/ual/AnimationLibrary_Godot_Standard.gltf");
const ual = JSON.parse(readFileSync(ualPath, "utf8"));
const ualNames = new Set((ual.animations ?? []).map((animation) => animation.name).filter(Boolean));
const bank = JSON.parse(readFileSync(join(publicRoot, "motion/bank.json"), "utf8"));
const bankNames = new Set(Object.keys(bank.clips ?? {}));
const knownClips = new Set([...ualNames, ...bankNames, ...embeddedAnimations]);

testRunner("every checked-in roster GLB file exists", () => {
  const fileRefs = [...rosterText.matchAll(/a\(\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"([^"]+)"\s*\)/g)]
    .map((match) => match[1])
    .filter((file) => !file.startsWith("@style:"));
  const missing = [...new Set(fileRefs)].filter((file) => !existsSync(join(publicRoot, "models/cast", file)));
  assert.deepEqual(missing, [], `roster references missing cast GLBs: ${missing.join(", ")}`);
});

testRunner("martial clip mappings exist in a checked-in GLB, UAL source, or baked bank", () => {
  assert.ok(martialBlock, "MARTIAL mapping table must exist");
  const missing = mappedClips.filter((clip) => !knownClips.has(clip));
  assert.deepEqual(missing, [], [
    "Martial profile references clips that do not exist in any checked-in animation source.",
    `Checked ${readableGlbs.length}/${glbFiles.length} GLBs; ${glbsWithAnimations.length} GLBs contain embedded animations.`,
    `UAL clips: ${ualNames.size}; baked bank clips: ${bankNames.size}; embedded GLB clips: ${embeddedAnimations.size}.`,
    `Missing: ${missing.join(", ")}`,
  ].join("\n"));
});
