#!/usr/bin/env node
/**
 * Compile .ink sources to .ink.json for the AshLane dialogue runtime.
 * Uses the compiler bundled with inkjs (MIT, inkle) — no extra installs.
 *
 *   node tools/dialogue/compile-ink.mjs src/game3d/dialogue/stories/static-backstage.ink
 *   node tools/dialogue/compile-ink.mjs --all   # compile every .ink under src/game3d/dialogue/stories
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Compiler } = require("inkjs/compiler/Compiler");

function compileOne(inkPath) {
  const src = readFileSync(inkPath, "utf8");
  const compiler = new Compiler(src);
  let story;
  try {
    story = compiler.Compile();
  } catch {
    console.error(`FAIL ${inkPath}`);
    for (const e of compiler.errors) console.error("  " + e);
    process.exitCode = 1;
    return;
  }
  for (const w of compiler.warnings) console.warn(`WARN ${inkPath}: ${w}`);
  const out = inkPath.replace(/\.ink$/, ".ink.json");
  writeFileSync(out, story.ToJson());
  console.log(`OK ${inkPath} -> ${out} (${story.ToJson().length} bytes)`);
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".ink")) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
if (args.includes("--all")) {
  const stories = walk("src/game3d/dialogue/stories");
  if (!stories.length) console.log("no .ink files found");
  for (const s of stories) compileOne(s);
} else if (args.length) {
  for (const a of args) compileOne(a);
} else {
  console.error("usage: compile-ink.mjs <file.ink...> | --all");
  process.exit(1);
}
