# Model Ingest Workflow

Every new model goes through the QC gate **before** it lands in
`public/models/`. No exceptions — this is how black blotches and similar
glitches stop reaching the game.

## The gate

```
new model (Tripo export / Drive pull / open-source)
        │
        ▼
  tools/model-qc/inbox/          ← drop the GLB here
        │
        ▼
  ./qc-model.sh inbox/MODEL.glb out/MODEL --repair --proof
        │
        ├── work/REPORT.md        ← read this
        ├── work/findings.json    ← machine-readable
        ├── proof/compare-*.png  ← SEE the before/after
        └── fixed.glb             ← only if repair applied
        │
        ▼
  human review: does the after render look right?
   ├── YES → copy fixed.glb (or original if clean) to public/models/…
   └── NO  → fix manually, re-run gate
```

## Rules

1. **Never copy a model into `public/models/` without a QC report.** The
   report lives next to the model: `out/<name>/work/REPORT.md`.
2. **A repair without before/after renders is not a repair.** `--proof`
   is mandatory when `--repair` changed anything.
3. **Auto-repair is capped.** The pipeline repaints at most 15% of a
   texture on its own. Anything bigger needs human eyes — the report says so.
4. **Errors block ingest.** NaN positions, unweighted skin verts, missing UVs
   on textured prims — fix the source model, don't hand-patch around it.
5. **Keep the proof.** `out/<name>/` is the audit trail. Don't delete it
   until the model ships.

## Batch re-scans

After pipeline updates, re-sweep the roster:

```bash
./qc-batch.sh ../../public/models/cast ./out/batch-YYYY-MM-DD 4
```

Review `BATCH_REPORT.md`. Models with new warnings get the single-model gate.
