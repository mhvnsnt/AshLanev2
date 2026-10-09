# Character Customizer — LANE-UI

The in-game character customization system. Lives **inside the game's own PWA
main menu** (`AshlaneApp` → "Customize a fighter" → `CustomizerPanel`), using
the **actual roster fighter GLBs** on a zoomable live 3D stage. A disconnected
tool is not acceptable and was not built.

## Player flow

1. Main menu → **Customize a fighter**.
2. Pick a fighter (roster grid). Their saved build loads automatically.
3. Drag to orbit, scroll/pinch (or the Zoom slider) to zoom. Double-click
   resets the camera.
4. Change eyes, body, attire, accessories, face paint — every control applies
   to the live model instantly.
5. **Save build** persists it (per fighter). **Reset** restores the authored look.

## Modules (`src/game3d/customization/customizer/`)

| File | Owns |
|---|---|
| `types.ts` | `CustomBuild` schema, morph/accessory/eye types, `FacePaintModule` contract |
| `eye-colors.ts` | Iris palette + procedural iris textures + material application |
| `morphs.ts` | Procedural bone-scale morphs (muscle / height / build / jaw) |
| `accessories.ts` | Lane-manifest loading, bone rebinding, slot registry |
| `facepaint-adapter.ts` | Bridge to the paint lane's module (stub until it lands) |
| `persistence.ts` | Versioned save/load of builds (`ashlane:customizer:builds`) |
| `preview.ts` | `CustomizerPreview` — standalone renderer, studio lighting, camera |

`src/components/customizer-panel.tsx` is the React UI; `ashlane-app.tsx`
renders it on the `"customizer"` menu screen.

## Eye colors (item 6)

**How eyes are built** (studied from `JUDAS_classic.glb`, 2026-10-08): two
sphere meshes (`Sphere`/`Sphere.001`) driven by a dedicated material
`JudasIris` (brown `baseColorFactor`, no texture). A 45-model cast survey found
**only Judas has a dedicated iris material** — every other model bakes eyes
into a shared face texture.

**Approach:** `findIrisMaterials()` locates materials named `*iris*` (falling
back to meshes/nodes named `*iris*`/`*pupil*`). On apply, each iris material is
**cloned once** (authored original kept pristine) and given a procedurally
generated 256px iris texture (limbal ring + radial striations + pupil) in the
chosen palette color. **Skin is never touched** — models without a dedicated
iris material get the palette disabled with an honest note, never a skin tint.

Palette: Natural (authored) + Brown, Dark Brown, Black, Hazel, Amber, Green,
Blue, Ice Blue, Gray, Violet, Blood Red.

## Morphs (item 7 — body/face)

The cast GLBs ship **zero morph targets**, so morphs are procedural bone
scaling. Bone names vary per rig (Judas `J_Hips`/`H_Upperarm_L…`, STICKUP
`mixamorig:Hips`/`mixamorig:LeftArm…`), so dials map to case-insensitive name
**patterns**:

- **Muscle** — upperarm/forearm/upleg/spine2/shoulder girth (×/z)
- **Height** — upleg/leg length (y); the preview re-grounds feet at y=0
- **Build** — hips/spine width (x/z)
- **Jaw** — jaw width (x/z)

Base scales are snapshotted per model; every apply resets to base first
(idempotent, never stacks). `supportedMorphs()` enables only dials that found
bones. Double-click a slider to snap back to 0.5 (authored).

## Accessories (item 7)

Slots: `hair`, `facialHair`, `mask`, `hood`, `chain`, `gloves`, `shoes`.

The customizer reads lane manifests at runtime — **no code change when a lane
merges**. Scanned locations (`accessories.ts` `MANIFEST_URLS`):

- `public/models/accessories/manifest.json` ✅ (4 chains, shipped)
- `public/models/hair/manifest.json` — masks-hoods-hair lane (pending)
- `public/models/masks/manifest.json` — masks-hoods-hair lane (pending)
- `public/models/hoods/manifest.json` — masks-hoods-hair lane (pending)
- `public/models/gloves/manifest.json` — gloves-shoes lane (pending)
- `public/models/shoes/manifest.json` — gloves-shoes lane (pending)

### Manifest contract

```json
{
  "accessories": [
    {
      "id": "chain_gold_ashlane",
      "label": "Gold AshLane Chain",
      "slot": "chain",
      "file": "models/accessories/chain_gold_ashlane_rigged.glb",
      "attach": {
        "bone": "Neck",
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "scale": 1
      }
    }
  ]
}
```

`file` is relative to `public/`. `attach.bone` is the preferred bone; the
loader falls back to case-insensitive match, then slot heuristics
(hair→head, chain→neck/spine2, gloves→hand, shoes→foot…).

**Rigged accessories rebind:** the chains ship skinned to `Neck`/`Spine2`
bones. Instead of hanging them statically, the loader **rebinds their skinned
meshes onto the fighter's matching bones** (exact name, then normalized-fuzzy:
`mixamorig:Neck`→`neck`, `J_Spine2`→`spine2` — same technique as
`quaternius.attachPart`), then binds in final position so they ride the body.
Non-skinned accessories hang from the manifest's attach bone with the authored
offset/rotation.

**DCC scale:** the chains are authored ~8x oversize for our fighters, so the
manifest `scale` (0.15 for the chains) is baked into the geometry and the
bone-inverse translations at attach time — scaling the holder instead would
break the skinning math. **Pendant orientation** is the chain lane's tuning
knob (`feature/chain-pendant-fix`): `attach.rotation` (degrees XYZ) applies as
a rigid rotation before binding. Measured: Judas's `J_Neck` maps chain-local
+z to world +x, so the pendant swings sideways at neutral rotation; X≈−103°
brings it forward-down on Judas rigs (Mixamo necks differ — tune per rig).

## Face paint

`facepaint-adapter.ts` dynamic-imports `../facepaint/index.ts` (the paint
lane's module). Until that lands it exposes a stub with `available: false`
and the UI shows **"Face paint system landing soon"** — no fake paint
options. Expected real-module shape is documented in the adapter's header;
**no customizer changes are needed when the paint lane merges**.

## Persistence

`persistence.ts` follows `saves.ts` conventions: versioned envelope
`{ schemaVersion, updatedAt, data }`, forward-only migrations, migrate-on-copy,
idb-keyval with localStorage fallback. Key: `ashlane:customizer:builds`
(backup: `...:backup`). One build per roster fighter id; corrupt/foreign saves
sanitize over `defaultBuild()` so they always produce a valid build.

## Fight-side application (follow-up)

Builds currently drive the customizer preview. To carry a player's build into
actual fights, `view.ts`'s `ensureCast` should call
`applyEyeColor` / `applyMorphs` / `attachAccessory` from this lane on the
adopted rig root using `loadBuild(fighterId)` — the hooks are public and the
build schema is stable. Left as the merge follow-up so the game loop stays
untouched on this branch.

## QC checklist (verification law)

Verified 2026-10-09 by the worker against the production build, via a
headless-Chromium harness driving the real modules (the full-app page can't
screenshot under SwiftShader in this environment — `Page.captureScreenshot`
hangs whenever WebGL is active; frames were pulled with `capturePNG()`):

- [x] `npm run typecheck` passes; `vite build` passes (EXIT:0).
- [x] Customizer panel renders from the PWA main menu ("Customize a fighter"
      button in `AshlaneApp`; `CustomizerPanel` on the `"customizer"` screen).
- [x] Preview renders the actual model (JUDAS_classic.glb, BANNON GLBs) with
      studio lighting; drag-orbit + wheel/pinch/slider zoom work.
- [x] Eye palette enables on the iris-material model (Judas): 12 colors apply
      via cloned materials + procedural iris textures; **skin untouched**
      (before/after frames compared). Baked-eye models (all 17 roster
      fighters surveyed) get the honest disabled note — never a skin tint.
- [x] Morph sliders offered only for detected bones (Judas: muscle/build/jaw);
      muscle=1 visibly thickens arms; double-click resets to authored.
- [x] Gold chain attaches at correct scale, rebinds to `J_Neck`/`J_Spine2`,
      detaches cleanly. Pendant orientation is the chain lane's knob (see above).
- [x] Save → mutate → reload round-trips: `{eye:"iceblue",
      chain:"chain_gold_ashlane", muscle:1}` persisted and restored from
      `ashlane:customizer:builds`.
- [x] Face paint shows "landing soon" (paint lane not merged — no fake paint).

Frames inspected: h1 (Judas natural), h2 (ice-blue eyes), eye close-ups
natural vs ice-blue, m1 (muscle max), m2/chain-scaled (chain attached).
