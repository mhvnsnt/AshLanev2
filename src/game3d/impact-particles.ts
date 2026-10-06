/**
 * Round 3 visuals — GPU point-sprite impact burst pool.
 *
 * One preallocated THREE.Points (2048 particles) with CPU-side integration.
 * Additive blending, per-particle size + alpha fade. Spawned from mount.ts's
 * combat SFX hook (hit / kick / ko / slam), so every landed strike pops.
 */
import * as THREE from "three";

export type ImpactKind =
  | "punch"
  | "kick"
  | "block"
  | "knockdown"
  | "blood"
  | "dust"
  | "spark";

export interface ImpactPoint {
  x: number;
  y: number;
  z: number;
}

const MAX = 2048;

interface KindCfg {
  count: number;
  speed: [number, number]; // horizontal speed range
  up: [number, number]; // initial upward velocity range
  size: [number, number];
  life: [number, number];
  gravity: number;
  drag: number;
  colors: number[]; // hex palette, picked per particle
}

const KINDS: Record<ImpactKind, KindCfg> = {
  punch: {
    count: 18, speed: [1.5, 5], up: [0.5, 3.2], size: [0.09, 0.2],
    life: [0.22, 0.45], gravity: 9, drag: 2.2,
    colors: [0xfff6d8, 0xffd34d, 0xffffff],
  },
  kick: {
    count: 26, speed: [2, 6.5], up: [0.8, 4], size: [0.1, 0.24],
    life: [0.28, 0.55], gravity: 9.5, drag: 2.0,
    colors: [0xffe9b0, 0xffb347, 0xff7a2e],
  },
  block: {
    count: 14, speed: [1, 3.5], up: [1, 3], size: [0.07, 0.16],
    life: [0.2, 0.4], gravity: 8, drag: 2.6,
    colors: [0xbfe3ff, 0x7fb8ff, 0xffffff],
  },
  knockdown: {
    count: 42, speed: [1.5, 7], up: [1, 5.5], size: [0.1, 0.3],
    life: [0.4, 0.9], gravity: 10, drag: 1.6,
    colors: [0x9a8f80, 0x6e6558, 0xcbbfae, 0xffd34d],
  },
  blood: {
    count: 22, speed: [1, 4.5], up: [0.5, 3.5], size: [0.06, 0.14],
    life: [0.3, 0.6], gravity: 14, drag: 1.2,
    colors: [0xa41212, 0xd42a1e, 0x7a0d0d],
  },
  dust: {
    count: 30, speed: [0.8, 3], up: [0.6, 2.4], size: [0.22, 0.5],
    life: [0.5, 1.1], gravity: 1.2, drag: 2.4,
    colors: [0x8f8a80, 0x6b665e, 0xa8a294],
  },
  spark: {
    count: 12, speed: [3, 9], up: [1, 5], size: [0.05, 0.12],
    life: [0.15, 0.35], gravity: 11, drag: 1.4,
    colors: [0xfff6d8, 0xfffbe8, 0xffd34d],
  },
};

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (320.0 / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    // soft radial falloff: hot core, fading edge
    float a = smoothstep(0.5, 0.08, d) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

export class ImpactParticles {
  readonly points: THREE.Points;
  private readonly geo: THREE.BufferGeometry;
  private readonly mat: THREE.ShaderMaterial;
  private readonly pos: Float32Array;
  private readonly col: Float32Array;
  private readonly size: Float32Array;
  private readonly alpha: Float32Array;
  private readonly vel: Float32Array; // 3 per particle
  private readonly life: Float32Array;
  private readonly maxLife: Float32Array;
  private readonly grav: Float32Array;
  private readonly drag: Float32Array;
  private readonly baseSize: Float32Array;
  private cursor = 0;
  private readonly tmpColor = new THREE.Color();

  constructor() {
    this.geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(MAX * 3);
    this.col = new Float32Array(MAX * 3);
    this.size = new Float32Array(MAX);
    this.alpha = new Float32Array(MAX);
    this.vel = new Float32Array(MAX * 3);
    this.life = new Float32Array(MAX);
    this.maxLife = new Float32Array(MAX);
    this.grav = new Float32Array(MAX);
    this.drag = new Float32Array(MAX);
    this.baseSize = new Float32Array(MAX);
    // park everything far underground with alpha 0
    for (let i = 0; i < MAX; i++) this.pos[i * 3 + 1] = -100;

    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    this.geo.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1));
    this.geo.setAttribute("aAlpha", new THREE.BufferAttribute(this.alpha, 1));
    this.geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 500);

    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
  }

  /** Fire a burst at a world position. Safe to call from the sim/SFX hook. */
  spawnImpactBurst(p: ImpactPoint, kind: ImpactKind): void {
    const cfg = KINDS[kind] ?? KINDS.punch;
    for (let n = 0; n < cfg.count; n++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % MAX;
      const i3 = i * 3;
      const th = Math.random() * Math.PI * 2;
      const sp = cfg.speed[0] + Math.random() * (cfg.speed[1] - cfg.speed[0]);
      this.pos[i3] = p.x + (Math.random() - 0.5) * 0.12;
      this.pos[i3 + 1] = p.y + (Math.random() - 0.5) * 0.12;
      this.pos[i3 + 2] = p.z + (Math.random() - 0.5) * 0.12;
      this.vel[i3] = Math.cos(th) * sp;
      this.vel[i3 + 1] = cfg.up[0] + Math.random() * (cfg.up[1] - cfg.up[0]);
      this.vel[i3 + 2] = Math.sin(th) * sp;
      const hex = cfg.colors[(Math.random() * cfg.colors.length) | 0];
      this.tmpColor.setHex(hex);
      this.col[i3] = this.tmpColor.r;
      this.col[i3 + 1] = this.tmpColor.g;
      this.col[i3 + 2] = this.tmpColor.b;
      this.baseSize[i] = cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]);
      this.size[i] = this.baseSize[i];
      const life = cfg.life[0] + Math.random() * (cfg.life[1] - cfg.life[0]);
      this.life[i] = life;
      this.maxLife[i] = life;
      this.grav[i] = cfg.gravity;
      this.drag[i] = cfg.drag;
      this.alpha[i] = 1;
    }
    (this.geo.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  }

  update(dt: number): void {
    if (dt <= 0) return;
    const posAttr = this.geo.getAttribute("position") as THREE.BufferAttribute;
    const sizeAttr = this.geo.getAttribute("aSize") as THREE.BufferAttribute;
    const alphaAttr = this.geo.getAttribute("aAlpha") as THREE.BufferAttribute;
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) {
        if (this.alpha[i] !== 0) this.alpha[i] = 0;
        continue;
      }
      this.life[i] -= dt;
      const i3 = i * 3;
      if (this.life[i] <= 0) {
        this.alpha[i] = 0;
        this.pos[i3 + 1] = -100;
        continue;
      }
      const dragK = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i3] *= dragK;
      this.vel[i3 + 2] *= dragK;
      this.vel[i3 + 1] = this.vel[i3 + 1] * dragK - this.grav[i] * dt;
      this.pos[i3] += this.vel[i3] * dt;
      this.pos[i3 + 1] += this.vel[i3 + 1] * dt;
      this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      if (this.pos[i3 + 1] < 0.02) {
        this.pos[i3 + 1] = 0.02;
        this.vel[i3 + 1] *= -0.35; // small bounce off the ground
      }
      const t = this.life[i] / this.maxLife[i];
      this.alpha[i] = t * t; // ease-out fade
      this.size[i] = this.baseSize[i] * (0.6 + 0.4 * t);
    }
    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
  }

  dispose(): void {
    this.geo.dispose();
    this.mat.dispose();
  }
}
