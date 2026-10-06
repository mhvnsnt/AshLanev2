#!/usr/bin/env node
/**
 * proof-walk.cjs — STEP 1 visual proof (owner 2026-10-06).
 * Renders walk tests for a sample of models across skeleton families,
 * walking TOWARD camera and ACROSS frame, through the shared staging path.
 * Every frame is eyeballed by the operator before step 2 (promo re-render).
 *
 * Usage: node proof-walk.cjs
 * Output: tools/promo-video/proof-walk-test/<model>_<dir>_t<T>.png
 */
const { execFileSync } = require('child_process');
const path = require('path');

const HERE = __dirname;
const OUT = path.join(HERE, 'proof-walk-test');

const MODELS = [
  'ONYX_street.glb',      // Mixamo, female
  'HOLLOW.glb',           // Mixamo, masked male
  'STATIC.glb',           // Mixamo, male
  'EL_TORO_DE_ORO.glb',   // Mixamo, reference (owner-approved pipeline)
  'JUDAS_classic.glb',    // C4D wrestling rig
  'BRIAN_CAGE_source.glb' // C4D wrestling rig
];
const DIRS = ['toward', 'across'];
const TIMES = [3.5, 5.0]; // mid-walk, well-framed, different phases

for (const model of MODELS) {
  for (const dir of DIRS) {
    for (const t of TIMES) {
      const tag = `${path.basename(model, '.glb')}_${dir}_t${t}`;
      console.log('=== ' + tag);
      execFileSync('node', [
        path.join(HERE, 'render-frames.cjs'),
        '--page', 'walk-test.html',
        '--model', model,
        '--extra', `dir=${dir}`,
        '--out', path.join(OUT, '_tmp'),
        '--start', String(t), '--end', String(t + 0.05),
        '--fps', '24', '--width', '960', '--height', '540',
      ], {
        cwd: HERE,
        env: { ...process.env, NODE_PATH: '/home/hatch/workspace/glb-renders/renderer/node_modules' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      // rename f_XXXXX.png -> <tag>.png
      const fs = require('fs');
      const tmp = path.join(OUT, '_tmp');
      const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png'));
      if (files.length) {
        fs.renameSync(path.join(tmp, files[0]), path.join(OUT, tag + '.png'));
      }
    }
  }
}
console.log('DONE -> ' + OUT);
