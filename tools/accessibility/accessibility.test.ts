/** Tests for tools/accessibility/accessibility.ts — run with node --test */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COLORBLIND_SAFE_PALETTES, simulateColorblind, palettesDistinguishable,
  DEFAULT_KEYBOARD_BINDINGS, DEFAULT_TOUCH_BINDINGS,
  validateBindings, serializeBindings, parseBindings, ALL_ACTIONS,
} from "./accessibility.ts";

describe("colorblind palettes", () => {
  it("every pair of faction palettes is distinguishable under all simulations", () => {
    for (let i = 0; i < COLORBLIND_SAFE_PALETTES.length; i++) {
      for (let j = i + 1; j < COLORBLIND_SAFE_PALETTES.length; j++) {
        const a = COLORBLIND_SAFE_PALETTES[i], b = COLORBLIND_SAFE_PALETTES[j];
        assert.ok(palettesDistinguishable(a, b), `${a.id} vs ${b.id} not distinguishable`);
      }
    }
  });
  it("simulation returns valid hex", () => {
    for (const t of ["protanopia", "deuteranopia", "tritanopia"] as const) {
      const out = simulateColorblind("#E69F00", t);
      assert.match(out, /^#[0-9a-f]{6}$/);
    }
  });
  it("every palette has a non-color cue", () => {
    for (const p of COLORBLIND_SAFE_PALETTES) assert.ok(p.cue.length > 0, p.id);
  });
});

describe("remappable controls", () => {
  it("default keyboard bindings cover all actions", () => {
    assert.deepEqual(validateBindings(DEFAULT_KEYBOARD_BINDINGS, ALL_ACTIONS), []);
  });
  it("default touch bindings cover all actions", () => {
    assert.deepEqual(validateBindings(DEFAULT_TOUCH_BINDINGS, ALL_ACTIONS), []);
  });
  it("detects unbound actions", () => {
    const issues = validateBindings({ punch: ["j"] }, ALL_ACTIONS);
    assert.ok(issues.some((i) => i.includes("kick")));
  });
  it("serialize/parse round-trips", () => {
    const s = serializeBindings(DEFAULT_KEYBOARD_BINDINGS);
    const { map, issues } = parseBindings(s, ALL_ACTIONS);
    assert.deepEqual(issues, []);
    assert.deepEqual(map.punch, ["j", "z"]);
  });
  it("bad JSON falls back to defaults", () => {
    const { map, issues } = parseBindings("not json", ALL_ACTIONS);
    assert.ok(issues.length > 0);
    assert.deepEqual(map, DEFAULT_KEYBOARD_BINDINGS);
  });
});
