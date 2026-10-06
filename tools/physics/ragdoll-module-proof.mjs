#!/usr/bin/env node
// Headless proof for src/game3d/physics/ragdoll.ts (Rapier module).
// Run from repo root:  node --experimental-strip-types tools/physics/ragdoll-module-proof.mjs
// Builds a synthetic Mixamo bone hierarchy, KOs it, steps 180 frames, asserts:
// 11 rigid bodies, hips fall to the ground, no ground penetration, bones sync.
// (The visual in-game proof is the /ragdoll-demo route, captured by scripts/playtest.mjs.)
import * as THREE from "three";
import {
  ensureRapier,
  PhysicsWorld,
  HumanoidRagdoll,
} from "../../src/game3d/physics/ragdoll.ts";

// Synthetic Mixamo bone hierarchy (T-pose-ish, meters). Proves the module's
// physics + bone-sync math headless — no renderer, no DOM needed.
function bone(name, x, y, z, parent) {
  const b = new THREE.Bone();
  b.name = name;
  b.position.set(x, y, z);
  if (parent) parent.add(b);
  return b;
}
const root = new THREE.Group();
const hips = bone("mixamorig:Hips", 0, 1.0, 0, root);
const spine = bone("mixamorig:Spine", 0, 0.15, 0, hips);
const spine1 = bone("mixamorig:Spine1", 0, 0.2, 0, spine);
const neck = bone("mixamorig:Neck", 0, 0.25, 0, spine1);
bone("mixamorig:Head", 0, 0.12, 0, neck);
for (const s of ["Right", "Left"]) {
  const sx = s === "Right" ? -1 : 1;
  const sh = bone(`mixamorig:${s}Shoulder`, sx * 0.1, 0.18, 0, spine1);
  const arm = bone(`mixamorig:${s}Arm`, sx * 0.12, 0, 0, sh);
  const fore = bone(`mixamorig:${s}ForeArm`, sx * 0.3, 0, 0, arm);
  bone(`mixamorig:${s}Hand`, sx * 0.28, 0, 0, fore);
  const up = bone(`mixamorig:${s}UpLeg`, sx * 0.11, -0.12, 0, hips);
  const leg = bone(`mixamorig:${s}Leg`, 0, -0.45, 0, up);
  bone(`mixamorig:${s}Foot`, 0, -0.45, 0, leg);
}
root.updateWorldMatrix(true, true);

await ensureRapier();
const physics = new PhysicsWorld();
physics.addGround(12, 0, 1.0);
const ragdoll = HumanoidRagdoll.fromFighter(physics, root);
console.log(`parts built: ${ragdoll.parts.length} (expect 11)`);

const hipsBefore = hips.getWorldPosition(new THREE.Vector3()).clone();
ragdoll.knockout(new THREE.Vector3(-0.7, 0.35, 0.6), 7);
for (let i = 0; i < 180; i++) {
  physics.step(1 / 60);
  ragdoll.sync();
}
root.updateWorldMatrix(true, true);
const hipsAfter = hips.getWorldPosition(new THREE.Vector3());
const moved = hipsBefore.distanceTo(hipsAfter);
const disp = ragdoll.displacementFromRest();
console.log(`hips moved: ${moved.toFixed(2)}m, total displacement: ${disp.toFixed(2)}`);
console.log(
  `hips y: ${hipsBefore.y.toFixed(2)} -> ${hipsAfter.y.toFixed(2)} (fell toward ground)`,
);

// ground penetration check: no bone below y=0 (within tolerance)
let minY = Infinity;
root.traverse((o) => {
  if (o instanceof THREE.Bone) {
    const p = o.getWorldPosition(new THREE.Vector3());
    if (p.y < minY) minY = p.y;
  }
});
console.log(`lowest bone y: ${minY.toFixed(3)} (must be >= -0.05)`);
const pass =
  ragdoll.parts.length === 11 && moved > 0.3 && hipsAfter.y < 0.6 && minY > -0.05;
console.log(pass ? "RAGDOLL PROOF: PASS" : "RAGDOLL PROOF: FAIL");
process.exit(pass ? 0 : 1);
