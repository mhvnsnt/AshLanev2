/**
 * model.ts — THE NARRATOR's real-time 3D model.
 *
 * A Shadow Wizard Money Gang wizard in a PURPLE robe, built procedurally in
 * three.js (no external assets — he's always available, even offline).
 * Based on the owner's avatar design: purple velvet hood, void-black face,
 * sparkly eye glints, diamond-grill smile, blonde braids, heavy gold chains.
 *
 * CRITICAL CANON: purple robe = The Narrator (outside the fiction, talks to
 * the PLAYER). RED robe = "Ashes"/Buffalo Bill (in-world character). Never mix.
 *
 * The rig is code-driven: buildNarrator() returns a group + an update()
 * function. Moods: idle | talk | point | shrug | facepalm | hype | appear | hide.
 * He floats — never walks. He's not bound by the world.
 */

import * as THREE from "three";

export type NarratorMood =
  | "idle"
  | "talk"
  | "point"
  | "shrug"
  | "facepalm"
  | "hype"
  | "appear"
  | "hide";

const PURPLE = 0x4b1a7d;
const PURPLE_DARK = 0x341158;
const VOID = 0x060309;
const GOLD = 0xd9a441;
const BLONDE = 0xc9a24d;
const BONE = 0xe8e2d5;

function std(color: number, roughness = 0.85, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function goldMat() {
  return new THREE.MeshStandardMaterial({
    color: GOLD,
    roughness: 0.28,
    metalness: 1.0,
  });
}

/** Tube along a curve — used for braids and chains. */
function tube(
  points: [number, number, number][],
  radius: number,
  material: THREE.Material,
  segments = 24,
) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
  );
  return new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 8), material);
}

export interface NarratorRig {
  group: THREE.Group;
  mood: NarratorMood;
  /** 0..1 — how open the grill/jaw is (driven by voice amplitude or timer) */
  talkAmount: number;
  setMood: (m: NarratorMood) => void;
  /** advance the rig; call every frame with dt seconds and elapsed t */
  update: (dt: number, t: number) => void;
  dispose: () => void;
}

export function buildNarrator(): NarratorRig {
  const group = new THREE.Group();
  const floatGroup = new THREE.Group();
  group.add(floatGroup);

  const robeMat = std(PURPLE, 0.9);
  const robeDark = std(PURPLE_DARK, 0.95);
  const voidMat = new THREE.MeshStandardMaterial({
    color: 0x000000, // pure black — the key light can't wash the void out
    roughness: 1,
    emissive: 0x150826,
    emissiveIntensity: 0.55,
  });
  const gold = goldMat();
  const blondeMat = std(BLONDE, 0.7);
  const boneMat = std(BONE, 0.5);

  // ---- Robe: lathe profile, narrow shoulders flaring to a wide hem ----
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.52, 0.0),
    new THREE.Vector2(0.5, 0.06),
    new THREE.Vector2(0.4, 0.35),
    new THREE.Vector2(0.33, 0.62),
    new THREE.Vector2(0.29, 0.85),
    new THREE.Vector2(0.24, 1.02),
    new THREE.Vector2(0.2, 1.12),
    new THREE.Vector2(0.16, 1.18),
  ];
  const robe = new THREE.Mesh(new THREE.LatheGeometry(profile, 28), robeMat);
  floatGroup.add(robe);

  // Gold hem trim
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.022, 8, 40), gold);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = 0.05;
  floatGroup.add(hem);

  // ---- Torso group (everything above the robe sits here) ----
  const torso = new THREE.Group();
  torso.position.y = 1.12;
  floatGroup.add(torso);

  // ---- Head group (pivot at neck for nods/tilts) ----
  const head = new THREE.Group();
  head.position.y = 0.32;
  torso.add(head);

  // Void face — black sphere, slightly forward, fills the hood opening
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 18), voidMat);
  face.position.set(0, 0.03, 0.1);
  face.scale.set(0.92, 1.05, 0.9);
  head.add(face);

  // Hood — sphere shell open at the front
  const hoodGeo = new THREE.SphereGeometry(
    0.3, 24, 18,
    Math.PI * 0.62, // phiStart — opening faces forward (+z)
    Math.PI * 0.76, // phiLength
    Math.PI * 0.08, // thetaStart
    Math.PI * 0.84, // thetaLength
  );
  const hood = new THREE.Mesh(hoodGeo, robeDark);
  hood.position.set(0, 0.08, -0.03);
  hood.rotation.y = Math.PI; // opening toward +z
  hood.scale.set(1.05, 1.25, 1.05);
  head.add(hood);

  // Hood peak — a soft cone tip above
  const peak = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 16), robeDark);
  peak.position.set(0, 0.42, -0.08);
  peak.rotation.x = -0.35;
  head.add(peak);

  // Eye glints — sparkly white octahedrons, additive
  const glintMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const eyeGeo = new THREE.OctahedronGeometry(0.028);
  const eyeL = new THREE.Mesh(eyeGeo, glintMat.clone());
  const eyeR = new THREE.Mesh(eyeGeo, glintMat.clone());
  eyeL.position.set(-0.08, 0.1, 0.315);
  eyeR.position.set(0.08, 0.1, 0.315);
  head.add(eyeL, eyeR);
  // tiny satellite sparkles
  const satGeo = new THREE.OctahedronGeometry(0.012);
  const sats: THREE.Mesh[] = [];
  [[-0.13, 0.16], [0.13, 0.05], [-0.04, 0.17]].forEach(([x, y]) => {
    const s = new THREE.Mesh(satGeo, glintMat.clone());
    s.position.set(x, y, 0.315);
    head.add(s);
    sats.push(s);
  });

  // Diamond grill — jaw group pivots open when talking
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.07, 0.26);
  head.add(jaw);
  const grillMat = new THREE.MeshStandardMaterial({
    color: 0xf4f6ff,
    roughness: 0.15,
    metalness: 0.9,
    emissive: 0x8899ff,
    emissiveIntensity: 0.25,
  });
  const teeth = new THREE.Group();
  const toothGeo = new THREE.BoxGeometry(0.038, 0.042, 0.02);
  for (let i = 0; i < 11; i++) {
    const a = (i / 10 - 0.5) * Math.PI * 0.8; // wide smile arc
    const tooth = new THREE.Mesh(toothGeo, grillMat);
    tooth.position.set(Math.sin(a) * 0.13, -Math.cos(a) * 0.032 - 0.008, 0.02 + Math.cos(a) * 0.014);
    tooth.rotation.z = -a * 0.7;
    teeth.add(tooth);
  }
  jaw.add(teeth);
  // dark mouth backing so the grill reads against the void
  const mouthBack = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  );
  mouthBack.position.set(0, -0.015, -0.02);
  mouthBack.scale.set(1.3, 0.55, 0.5);
  jaw.add(mouthBack);

  // Braids — two thinner blonde braids hanging down the front, with ring bands
  const braidMat = blondeMat;
  const ringGeo = new THREE.TorusGeometry(0.04, 0.01, 8, 16);
  function braid(side: 1 | -1) {
    const g = new THREE.Group();
    const b = tube(
      [
        [side * 0.17, 0.3, 0.15],
        [side * 0.24, 0.08, 0.28],
        [side * 0.27, -0.18, 0.3],
        [side * 0.25, -0.44, 0.26],
        [side * 0.23, -0.62, 0.2],
      ],
      0.027,
      braidMat,
      24,
    );
    g.add(b);
    [[0.02, 0.285], [-0.3, 0.27]].forEach(([y, z]) => {
      const r = new THREE.Mesh(ringGeo, gold);
      r.position.set(side * (0.25 + Math.abs(y) * 0.06), y, z);
      r.rotation.x = Math.PI / 2 - 0.15;
      g.add(r);
    });
    return g;
  }
  head.add(braid(-1), braid(1));

  // Gold chains — layered catenary tubes + a pendant
  const chainGroup = new THREE.Group();
  chainGroup.position.y = -0.02;
  torso.add(chainGroup);
  const chainRadii: Array<[number, number]> = [
    [0.3, 0.028],
    [0.36, 0.032],
    [0.42, 0.026],
  ];
  chainRadii.forEach(([w, r], i) => {
    const drop = 0.16 + i * 0.09;
    const c = tube(
      [
        [-w * 0.55, 0.02, 0.2],
        [-w * 0.3, -drop * 0.75, 0.26],
        [0, -drop, 0.28],
        [w * 0.3, -drop * 0.75, 0.26],
        [w * 0.55, 0.02, 0.2],
      ],
      r,
      gold,
      24,
    );
    chainGroup.add(c);
  });
  const pendant = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 8, 20), gold);
  pendant.position.set(0, -0.42, 0.29);
  chainGroup.add(pendant);

  // ---- Arms: shoulder pivots, tapered sleeves, pale hands ----
  function arm(side: 1 | -1) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.24, 0.12, 0);
    torso.add(shoulder);
    // sleeve — flared cone
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.13, 0.42, 12),
      robeMat,
    );
    sleeve.position.y = -0.2;
    shoulder.add(sleeve);
    // hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), boneMat);
    hand.position.y = -0.46;
    hand.scale.set(0.85, 1.15, 0.85);
    shoulder.add(hand);
    // gold cuff ring
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.014, 8, 18), gold);
    cuff.position.y = -0.36;
    cuff.rotation.x = Math.PI / 2;
    shoulder.add(cuff);
    // rest pose: arms hang slightly out
    shoulder.rotation.z = side * 0.22;
    return { shoulder, hand };
  }
  const armL = arm(-1);
  const armR = arm(1);

  // ---- Rig state + animation ----
  let mood: NarratorMood = "idle";
  let moodT = 0; // time in current mood
  let appearT = 1; // 0..1 — 1 = fully present
  const rig: NarratorRig = {
    group,
    mood,
    talkAmount: 0,
    setMood(m: NarratorMood) {
      if (m === mood) return;
      mood = m;
      moodT = 0;
      rig.mood = m;
      if (m === "appear") appearT = 0;
    },
    update(dt: number, t: number) {
      moodT += dt;
      const m = mood;
      const talk = rig.talkAmount;

      // --- appear / hide drive overall presence ---
      if (m === "appear") appearT = Math.min(1, appearT + dt * 1.4);
      if (m === "hide") appearT = Math.max(0, appearT - dt * 1.8);
      const e = appearT < 1 ? 1 - Math.pow(1 - appearT, 3) : 1; // easeOutCubic
      group.scale.setScalar(Math.max(0.001, e));
      group.visible = appearT > 0.001;

      // --- float: he hovers, never walks ---
      const hypeBoost = m === "hype" ? 1.8 : 1;
      floatGroup.position.y = Math.sin(t * 1.25) * 0.055 * hypeBoost + (1 - e) * -0.9;
      floatGroup.rotation.z = Math.sin(t * 0.7) * 0.03;
      floatGroup.rotation.y = Math.sin(t * 0.4) * 0.08;

      // --- head life ---
      const nod = m === "talk" ? Math.sin(t * 7) * 0.035 * Math.min(1, talk * 2) : 0;
      head.rotation.x = Math.sin(t * 0.9) * 0.04 + nod;
      head.rotation.y =
        m === "point" ? 0.3 : m === "facepalm" ? -0.15 : Math.sin(t * 0.5) * 0.1;
      head.rotation.z = m === "shrug" ? 0.18 : Math.sin(t * 0.65) * 0.04;

      // --- jaw / grill talk ---
      const jawOpen = m === "talk" ? 0.12 + talk * 0.5 + Math.abs(Math.sin(t * 9)) * 0.12 * talk : 0;
      jaw.rotation.x += (Math.min(0.55, jawOpen) - jaw.rotation.x) * Math.min(1, dt * 18);
      jaw.position.y = -0.06 - jaw.rotation.x * 0.06;

      // --- eye glint twinkle ---
      const tw = 0.75 + Math.abs(Math.sin(t * 2.3)) * 0.45;
      eyeL.scale.setScalar(tw);
      eyeR.scale.setScalar(2 - tw > 1.4 ? 1.2 : tw * 0.9 + 0.2);
      sats.forEach((s, i) => s.scale.setScalar(0.5 + Math.abs(Math.sin(t * 3 + i * 2)) * 0.8));

      // --- arms per mood ---
      const armSpeed = Math.min(1, dt * 8);
      const targets = {
        L: { x: 0, z: -0.22 },
        R: { x: 0, z: 0.22 },
      };
      if (m === "point") {
        // right arm extends toward the viewer (the PLAYER)
        targets.R = { x: -1.25, z: 0.35 };
        targets.L = { x: 0.15, z: -0.3 };
      } else if (m === "shrug") {
        targets.L = { x: -0.5, z: -1.05 };
        targets.R = { x: -0.5, z: 1.05 };
      } else if (m === "facepalm") {
        targets.R = { x: -2.2, z: -0.25 }; // hand up to the face
        targets.L = { x: 0.3, z: -0.35 };
      } else if (m === "hype") {
        const w = Math.sin(t * 5) * 0.35;
        targets.L = { x: -2.4 + w * 0.2, z: -0.5 };
        targets.R = { x: -2.4 - w * 0.2, z: 0.5 };
      } else if (m === "talk") {
        targets.R = { x: -0.55 + Math.sin(t * 3.2) * 0.12, z: 0.4 };
        targets.L = { x: -0.15, z: -0.3 };
      }
      armL.shoulder.rotation.x += (targets.L.x - armL.shoulder.rotation.x) * armSpeed;
      armL.shoulder.rotation.z += (targets.L.z - armL.shoulder.rotation.z) * armSpeed;
      armR.shoulder.rotation.x += (targets.R.x - armR.shoulder.rotation.x) * armSpeed;
      armR.shoulder.rotation.z += (targets.R.z - armR.shoulder.rotation.z) * armSpeed;

      // facepalm: tuck the hand toward the face
      if (m === "facepalm") {
        armR.hand.position.lerp(new THREE.Vector3(0.02, -0.1, 0.32), armSpeed * 0.8);
      } else {
        armR.hand.position.lerp(new THREE.Vector3(0, -0.46, 0), armSpeed * 0.8);
      }

      // --- robe sway ---
      robe.rotation.y = Math.sin(t * 0.55) * 0.05;
    },
    dispose() {
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else if (mat) mat.dispose();
      });
    },
  };

  return rig;
}

/** Small standalone scene for rendering the narrator (PiP overlay use). */
export function createNarratorScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(0, 1.15, 3.1);
  camera.lookAt(0, 1.05, 0);

  const hemi = new THREE.HemisphereLight(0x8a6bbf, 0x120a1e, 1.15);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2dd, 1.6);
  key.position.set(2.2, 3.2, 2.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9a5cff, 0.9);
  rim.position.set(-2.4, 1.6, -1.8);
  scene.add(rim);
  // warm glint for the gold
  const glint = new THREE.PointLight(0xffd27a, 12, 8);
  glint.position.set(0.8, 1.8, 1.4);
  scene.add(glint);

  // faint purple aura disc under him — he floats, doesn't stand
  const aura = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 32),
    new THREE.MeshBasicMaterial({
      color: 0x7a3cff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.02;
  scene.add(aura);

  return { scene, camera, aura };
}
