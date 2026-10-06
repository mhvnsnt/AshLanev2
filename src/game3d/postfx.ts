/**
 * Round 3 visuals — post-processing chain for the main 3D view.
 *
 * EffectComposer pipeline: RenderPass -> UnrealBloomPass (threshold ~0.85 so
 * only hot highlights / neon / sparks bloom) -> VignetteShader -> OutputPass.
 *
 * Toggle: `graphics.postFx` (default ON on desktop, OFF on phones — matches
 * the `phone` detection in view.ts). Mount exposes it as `setPostFx()`.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { VignetteShader } from "three/addons/shaders/VignetteShader.js";

/** Shared graphics toggles (singleton — view.ts and mount.ts read the same object). */
export const graphics = {
  /** Post-processing chain on/off. Default ON desktop / OFF phones. */
  postFx: true,
  /** Bloom strength 0..1.5 (only applied while postFx is on). */
  bloomStrength: 0.55,
};

export class PostFx {
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private vignette: ShaderPass | null = null;
  private readonly aa: boolean;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    opts: { phone: boolean },
  ) {
    // Default ON desktop / OFF phones (mirrors the `phone` detection in view.ts).
    graphics.postFx = !opts.phone;
    this.aa = !opts.phone;
  }

  get enabled(): boolean {
    return graphics.postFx;
  }

  setEnabled(on: boolean): void {
    graphics.postFx = on;
    if (on && !this.composer) this.build();
  }

  private build(): void {
    const size = new THREE.Vector2();
    this.renderer.getSize(size);
    const pr = this.renderer.getPixelRatio();
    // MSAA render target keeps edges smooth under the composer on desktop.
    const rt = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(size.x * pr)),
      Math.max(1, Math.floor(size.y * pr)),
      { type: THREE.HalfFloatType, samples: this.aa ? 4 : 0 },
    );
    const composer = new EffectComposer(this.renderer, rt);
    composer.setPixelRatio(pr);
    composer.setSize(size.x, size.y);

    composer.addPass(new RenderPass(this.scene, this.camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(Math.max(1, size.x), Math.max(1, size.y)),
      graphics.bloomStrength, // strength
      0.5, // radius
      0.85, // threshold — only hot highlights bloom
    );
    this.bloom = bloom;
    composer.addPass(bloom);

    const vignette = new ShaderPass(VignetteShader);
    const u = vignette.uniforms as Record<string, { value: number }>;
    if (u.offset) u.offset.value = 1.05;
    if (u.darkness) u.darkness.value = 1.18;
    this.vignette = vignette;
    composer.addPass(vignette);

    composer.addPass(new OutputPass());
    this.composer = composer;
  }

  /** Drop-in replacement for renderer.render(scene, camera). */
  render(): void {
    if (!graphics.postFx) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    if (!this.composer) this.build();
    if (this.bloom) this.bloom.strength = graphics.bloomStrength;
    this.composer!.render();
  }

  /** Mirror of the view's resize() — keeps the composer in sync. */
  setSize(w: number, h: number): void {
    this.composer?.setSize(Math.max(1, w), Math.max(1, h));
  }

  setPixelRatio(pr: number): void {
    this.composer?.setPixelRatio(pr);
  }

  dispose(): void {
    this.composer?.dispose();
    this.composer = null;
    this.bloom = null;
    this.vignette = null;
  }
}
