/** Tests for mod-loader-prototype.ts — run with node --test */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  validateManifest, satisfiesGameVersion, loadMods,
} from "./mod-loader-prototype.ts";

describe("validateManifest", () => {
  it("accepts a good manifest", () => {
    const { manifest, errors } = validateManifest({
      id: "my-pack", name: "My Pack", version: "1.0.0",
      assets: { fighters: [{ id: "ryu2", model: "models/ryu2.glb" }] },
    });
    assert.deepEqual(errors, []);
    assert.equal(manifest!.id, "my-pack");
  });
  it("rejects bad ids, versions, paths", () => {
    const { errors } = validateManifest({
      id: "BAD ID!", name: "", version: "v1",
      assets: {
        fighters: [{ id: "x", model: "/etc/passwd" }, { id: "y", model: "m.obj" }],
        stages: [{ id: "s", model: "../evil.glb" }],
      },
    });
    assert.ok(errors.length >= 5, errors.join("|"));
  });
});

describe("satisfiesGameVersion", () => {
  it("handles ranges", () => {
    assert.ok(satisfiesGameVersion(">=0.9.0", "1.2.0"));
    assert.ok(!satisfiesGameVersion(">=2.0.0", "1.2.0"));
    assert.ok(satisfiesGameVersion("*", "0.1.0"));
    assert.ok(satisfiesGameVersion(undefined, "9.9.9"));
    assert.ok(!satisfiesGameVersion("^1.0.0", "1.2.0")); // unsupported syntax -> incompatible
  });
});

describe("loadMods", () => {
  let dir: string;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), "mods-")); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  function mod(id: string, manifest: object, files: string[] = []) {
    const d = join(dir, id); mkdirSync(d, { recursive: true });
    writeFileSync(join(d, "ashlane.mod.json"), JSON.stringify(manifest));
    for (const f of files) {
      const fp = join(d, f); mkdirSync(join(fp, ".."), { recursive: true });
      writeFileSync(fp, "fake-glb");
    }
  }

  it("loads a valid mod with existing assets", () => {
    mod("pack1", {
      id: "pack1", name: "P1", version: "1.0.0", gameVersion: ">=0.9.0",
      assets: { fighters: [{ id: "f1", model: "m/f1.glb" }], stages: [{ id: "s1", model: "m/s1.glb" }] },
    }, ["m/f1.glb", "m/s1.glb"]);
    const plan = loadMods(dir, "1.0.0");
    assert.equal(plan.errors.length, 0);
    assert.equal(plan.mods.length, 1);
    assert.equal(plan.mods[0].fighters.length, 1);
    assert.equal(plan.mods[0].stages.length, 1);
  });

  it("skips missing asset files and duplicate ids", () => {
    mod("pack1", {
      id: "pack1", name: "P1", version: "1.0.0",
      assets: { fighters: [{ id: "f1", model: "m/f1.glb" }, { id: "f2", model: "m/nope.glb" }] },
    }, ["m/f1.glb"]);
    mod("pack2", {
      id: "pack2", name: "P2", version: "1.0.0",
      assets: { fighters: [{ id: "f1", model: "m/f1.glb" }] },
    }, ["m/f1.glb"]);
    const plan = loadMods(dir, "1.0.0");
    assert.equal(plan.mods.length, 2);
    const p1 = plan.mods.find((m) => m.manifest.id === "pack1")!;
    assert.equal(p1.fighters.length, 1);
    assert.ok(p1.skipped.some((s) => s.includes("nope.glb")));
    const p2 = plan.mods.find((m) => m.manifest.id === "pack2")!;
    assert.equal(p2.fighters.length, 0);
    assert.ok(p2.skipped.some((s) => s.includes("duplicate")));
  });

  it("rejects incompatible game versions and bad manifests", () => {
    mod("oldpack", { id: "oldpack", name: "O", version: "1.0.0", gameVersion: ">=99.0.0" });
    mod("badpack", { id: "BAD", name: "B", version: "1.0.0" });
    const plan = loadMods(dir, "1.0.0");
    assert.equal(plan.mods.length, 0);
    assert.equal(plan.errors.length, 2);
  });

  it("empty/missing dir is fine", () => {
    assert.deepEqual(loadMods(join(dir, "nope"), "1.0.0"), { mods: [], errors: [] });
  });
});
