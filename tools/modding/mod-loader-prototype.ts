/**
 * mod-loader-prototype.ts — Round 4: data-only mod loader prototype.
 *
 * MIT (new code). No dependencies. Node-testable.
 *
 * Scans a mods/ directory for ashlane.mod.json manifests, validates them,
 * and returns a load plan. Data-only: never imports or evals mod code.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export interface ModFighter {
  id: string; model: string; portrait?: string;
  height?: number; moveset?: string;
}
export interface ModStage { id: string; model: string; thumbnail?: string; }
export interface ModManifest {
  id: string; name: string; version: string; author?: string;
  gameVersion?: string; assets?: { fighters?: ModFighter[]; stages?: ModStage[] };
}
export interface LoadedMod {
  manifest: ModManifest; dir: string;
  fighters: ModFighter[]; stages: ModStage[];
  skipped: string[];
}
export interface LoadPlan { mods: LoadedMod[]; errors: string[]; }

const SEMVER = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
const ID = /^[a-z0-9][a-z0-9-_]{1,63}$/;

/** Very small semver-range check: supports ">=x.y.z" and "*" only. */
export function satisfiesGameVersion(range: string | undefined, gameVersion: string): boolean {
  if (!range || range === "*") return true;
  const m = range.trim().match(/^>=\s*(\d+\.\d+\.\d+)$/);
  if (!m) return false; // unsupported range syntax -> treat as incompatible
  const cmp = (a: string, b: string) => {
    const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
  };
  return cmp(gameVersion, m[1]) >= 0;
}

function isSafeRelPath(p: string): boolean {
  return typeof p === "string" && p.length > 0 && !p.startsWith("/") &&
    !p.includes("\\") && !p.split("/").includes("..");
}

export function validateManifest(raw: unknown): { manifest?: ModManifest; errors: string[] } {
  const errors: string[] = [];
  if (typeof raw !== "object" || raw === null) return { errors: ["manifest is not an object"] };
  const m = raw as Record<string, unknown>;
  if (typeof m.id !== "string" || !ID.test(m.id)) errors.push("bad id (lowercase alnum, -, _)");
  if (typeof m.name !== "string" || !m.name.trim()) errors.push("missing name");
  if (typeof m.version !== "string" || !SEMVER.test(m.version)) errors.push("bad version (semver)");
  const assets = (m.assets ?? {}) as Record<string, unknown>;
  for (const f of (assets.fighters ?? []) as ModFighter[]) {
    if (!ID.test(f.id ?? "")) errors.push(`fighter bad id: ${f.id}`);
    if (!isSafeRelPath(f.model ?? "")) errors.push(`fighter ${f.id}: unsafe model path`);
    if (!/\.(glb|gltf)$/i.test(f.model ?? "")) errors.push(`fighter ${f.id}: model must be .glb/.gltf`);
  }
  for (const s of (assets.stages ?? []) as ModStage[]) {
    if (!ID.test(s.id ?? "")) errors.push(`stage bad id: ${s.id}`);
    if (!isSafeRelPath(s.model ?? "")) errors.push(`stage ${s.id}: unsafe model path`);
  }
  if (errors.length) return { errors };
  return { manifest: m as unknown as ModManifest, errors: [] };
}

/** Scan modsDir, validate, check asset files exist, resolve id conflicts. */
export function loadMods(modsDir: string, gameVersion: string): LoadPlan {
  const plan: LoadPlan = { mods: [], errors: [] };
  if (!existsSync(modsDir)) return plan;
  const seen = new Set<string>();
  for (const entry of readdirSync(modsDir)) {
    const dir = join(modsDir, entry);
    let st; try { st = statSync(dir); } catch { continue; }
    if (!st.isDirectory()) continue;
    const manifestPath = join(dir, "ashlane.mod.json");
    if (!existsSync(manifestPath)) { plan.errors.push(`${entry}: missing ashlane.mod.json`); continue; }
    let raw: unknown;
    try { raw = JSON.parse(readFileSync(manifestPath, "utf8")); }
    catch { plan.errors.push(`${entry}: manifest JSON parse failed`); continue; }
    const { manifest, errors } = validateManifest(raw);
    if (!manifest) { plan.errors.push(`${entry}: ${errors.join("; ")}`); continue; }
    if (!satisfiesGameVersion(manifest.gameVersion, gameVersion)) {
      plan.errors.push(`${manifest.id}: needs game ${manifest.gameVersion}, have ${gameVersion}`);
      continue;
    }
    const loaded: LoadedMod = { manifest, dir, fighters: [], stages: [], skipped: [] };
    for (const f of manifest.assets?.fighters ?? []) {
      if (seen.has("fighter:" + f.id)) { loaded.skipped.push(`fighter ${f.id} (duplicate id)`); continue; }
      if (!existsSync(join(dir, f.model))) { loaded.skipped.push(`fighter ${f.id} (missing ${f.model})`); continue; }
      seen.add("fighter:" + f.id); loaded.fighters.push(f);
    }
    for (const s of manifest.assets?.stages ?? []) {
      if (seen.has("stage:" + s.id)) { loaded.skipped.push(`stage ${s.id} (duplicate id)`); continue; }
      if (!existsSync(join(dir, s.model))) { loaded.skipped.push(`stage ${s.id} (missing ${s.model})`); continue; }
      seen.add("stage:" + s.id); loaded.stages.push(s);
    }
    plan.mods.push(loaded);
  }
  return plan;
}
