/**
 * Vendored: ZzFX - Zuper Zmall Zound Zynth v1.4.0 by Frank Force
 * https://github.com/KilledByAPixel/ZzFX
 *
 * TypeScript adaptation for AshLane. The synthesis code is faithful to the
 * original; the only changes are:
 *  - typed parameters (strict TS),
 *  - lazy AudioContext creation (the original builds one at module load,
 *    which throws during SSR / when `window` is undefined),
 *  - null-safe playback: every play call no-ops cleanly when no audio
 *    context is available.
 *
 * ZzFX MIT License
 *
 *   Copyright (c) 2019 - Frank Force
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

// Shared lazy audio context — created on first use, never at import time.
let sharedCtx: AudioContext | null = null;
let ctxFailed = false;

/** Get (or create) the shared AudioContext. Null when unavailable (SSR, blocked autoplay, etc.). */
export function zzfxAudioContext(): AudioContext | null {
  if (sharedCtx) {
    if (sharedCtx.state === 'suspended') void sharedCtx.resume();
    return sharedCtx;
  }
  if (ctxFailed) return null;
  try {
    if (typeof window === 'undefined') return null;
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) {
      ctxFailed = true;
      return null;
    }
    sharedCtx = new AC();
    return sharedCtx;
  } catch {
    ctxFailed = true;
    return null;
  }
}

/**
 * Build the raw sample buffer for a ZzFX sound.
 * Parameters (in order): volume, randomness, frequency, attack, sustain,
 * release, shape, shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime,
 * repeatTime, noise, modulation, bitCrush, delay, sustainVolume, decay,
 * tremolo, filter.
 */
export function zzfxBuildSamples(
  volume = 1,
  randomness = 0.05,
  frequency = 220,
  attack = 0,
  sustain = 0,
  release = 0.1,
  shape = 0,
  shapeCurve = 1,
  slide = 0,
  deltaSlide = 0,
  pitchJump = 0,
  pitchJumpTime = 0,
  repeatTime = 0,
  noise = 0,
  modulation = 0,
  bitCrush = 0,
  delay = 0,
  sustainVolume = 1,
  decay = 0,
  tremolo = 0,
  filter = 0,
): Float32Array {
  const sampleRate = ZZFX.sampleRate;
  const PI2 = Math.PI * 2;
  const abs = Math.abs;
  const sign = (v: number) => (v < 0 ? -1 : 1);
  const startSlide = (slide *= (500 * PI2) / sampleRate / sampleRate);
  let startFrequency = (frequency *=
    (1 + randomness * 2 * Math.random() - randomness) * (PI2 / sampleRate));
  let modOffset = 0; // modulation offset
  let repeat = 0; // repeat offset
  let crush = 0; // bit crush offset
  let jump: number = 1; // pitch jump timer
  let length: number; // sample length
  let b: Float32Array; // sample buffer
  let t = 0; // sample time
  let i = 0; // sample index
  let s = 0; // sample value
  let f: number; // wave frequency

  // biquad LP/HP filter
  const quality = 2;
  const w = (PI2 * abs(filter) * 2) / sampleRate;
  const cos = Math.cos(w);
  const alpha = Math.sin(w) / 2 / quality;
  const a0 = 1 + alpha;
  const a1 = (-2 * cos) / a0;
  const a2 = (1 - alpha) / a0;
  const b0 = ((1 + sign(filter) * cos) / 2) / a0;
  const b1 = (-(sign(filter) + cos) / a0);
  const b2 = b0;
  let x2 = 0;
  let x1 = 0;
  let y2 = 0;
  let y1 = 0;

  // scale by sample rate
  const minAttack = 9; // prevent pop if attack is 0
  attack = attack * sampleRate || minAttack;
  decay *= sampleRate;
  sustain *= sampleRate;
  release *= sampleRate;
  delay *= sampleRate;
  deltaSlide *= (500 * PI2) / sampleRate ** 3;
  modulation *= PI2 / sampleRate;
  pitchJump *= PI2 / sampleRate;
  pitchJumpTime *= sampleRate;
  repeatTime = (repeatTime * sampleRate) | 0;

  // allocate the full sample buffer up front, much faster than growing an array
  length = (attack + decay + sustain + release + delay) | 0;
  b = new Float32Array(length > 0 ? length : 0);

  // generate waveform
  for (; i < length; b[i++] = s * volume) {
    // sample
    if (!(++crush % ((bitCrush * 100) | 0))) {
      // bit crush
      s = shape
        ? shape > 1
          ? shape > 2
            ? shape > 3
              ? shape > 4
                ? t / PI2 % 1 < shapeCurve / 2 // wave shape
                  ? 1
                  : -1 // 5 square duty
                : Math.sin(t ** 3) // 4 noise
              : Math.max(Math.min(Math.tan(t), 1), -1) // 3 tan
            : 1 - ((2 * t) / PI2 % 2 + 2) % 2 // 2 saw
          : 1 - 4 * abs(Math.round(t / PI2) - t / PI2) // 1 triangle
        : Math.sin(t); // 0 sin

      s =
        (repeatTime // tremolo
          ? 1 - tremolo + tremolo * Math.sin((PI2 * i) / repeatTime)
          : 1) *
        (shape > 4 ? s : sign(s) * abs(s) ** shapeCurve) * // shape curve
        (i < attack
          ? i / attack // attack
          : i < attack + decay // decay
            ? 1 - ((i - attack) / decay) * (1 - sustainVolume) // decay falloff
            : i < attack + decay + sustain // sustain
              ? sustainVolume // sustain volume
              : i < length - delay // release
                ? ((length - i - delay) / release) * // release falloff
                  sustainVolume // release volume
                : 0); // post release

      s = delay
        ? s / 2 + // delay
          (delay > i
            ? 0
            : ((i < length - delay ? 1 : (length - i) / delay) * // release delay
                b[(i - delay) | 0]) /
              2 /
              volume) // sample delay
        : s;

      if (filter)
        // apply filter
        s = y1 = b2 * x2 + b1 * (x2 = x1) + b0 * (x1 = s) - a2 * y2 - a1 * (y2 = y1);
    }

    f = (frequency += slide += deltaSlide) * // frequency
      Math.cos(modulation * modOffset++); // modulation
    t += f + f * noise * ((i * i * PI2) % 2 - 1); // noise

    if (jump && ++jump > pitchJumpTime) {
      // pitch jump
      frequency += pitchJump; // apply pitch jump
      startFrequency += pitchJump; // also apply to start
      jump = 0; // stop pitch jump time
    }

    if (repeatTime && !(++repeat % repeatTime)) {
      // repeat
      frequency = startFrequency; // reset frequency
      slide = startSlide; // reset slide
      jump ||= 1; // reset pitch jump time
    }
  }

  return b; // return sample buffer
}

/** ZZFX API for playing sounds. */
export const ZZFX = {
  /** Master volume scale. */
  volume: 0.3,

  /** Sample rate for audio. */
  sampleRate: 44100,

  /** Shared audio context (lazy — null when unavailable). */
  get audioContext(): AudioContext | null {
    return zzfxAudioContext();
  },

  /** Play a sound from ZzFX parameters. Null-safe: returns null with no audio. */
  play(...parameters: number[]): AudioBufferSourceNode | null {
    // build samples and start sound
    return this.playSamples([zzfxBuildSamples(...parameters)]);
  },

  /** Play an array of sample channels. Null-safe. */
  playSamples(
    sampleChannels: Float32Array[],
    volumeScale = 1,
    rate = 1,
    pan = 0,
    loop = false,
  ): AudioBufferSourceNode | null {
    const ctx = zzfxAudioContext();
    if (!ctx || sampleChannels.length === 0) return null;
    try {
      // create buffer and source
      const channelCount = sampleChannels.length;
      const sampleLength = sampleChannels[0].length;
      const buffer = ctx.createBuffer(channelCount, sampleLength, this.sampleRate);
      const source = ctx.createBufferSource();

      // copy samples to buffer and setup source
      sampleChannels.forEach((c, idx) => buffer.getChannelData(idx).set(c));
      source.buffer = buffer;
      source.playbackRate.value = rate;
      source.loop = loop;

      // create and connect gain node
      const gainNode = ctx.createGain();
      gainNode.gain.value = this.volume * volumeScale;
      gainNode.connect(ctx.destination);

      // connect source to stereo panner and gain
      try {
        const pannerNode = new StereoPannerNode(ctx, { pan });
        source.connect(pannerNode).connect(gainNode);
      } catch {
        source.connect(gainNode);
      }
      source.start();

      // return sound
      return source;
    } catch {
      return null;
    }
  },

  /** Build an array of samples (alias for the standalone function). */
  buildSamples: zzfxBuildSamples,

  /** Get frequency of a musical note on a diatonic scale. */
  getNote(semitoneOffset = 0, rootNoteFrequency = 440): number {
    return rootNoteFrequency * 2 ** (semitoneOffset / 12);
  },
};

/** Play a ZzFX sound from parameters. Null-safe. */
export function zzfx(...parameters: number[]): AudioBufferSourceNode | null {
  return ZZFX.play(...parameters);
}

/** Sound object that can precache and play ZzFX sounds. */
export class ZZFXSound {
  private readonly zzfxSound: number[];
  private readonly randomness: number;
  private readonly samples: Float32Array | null;
  private source: AudioBufferSourceNode | null = null;

  constructor(zzfxSound: number[] = []) {
    this.zzfxSound = zzfxSound;

    // extract randomness parameter from zzfxSound
    this.randomness = zzfxSound[1] !== undefined ? zzfxSound[1] : 0.05;
    zzfxSound[1] = 0; // generate without frequency randomness

    // cache the sound samples
    this.samples = zzfxSound.length > 0 ? ZZFX.buildSamples(...zzfxSound) : null;
  }

  play(
    volume = 1,
    pitch = 1,
    randomnessScale = 1,
    pan = 0,
    loop = false,
  ): AudioBufferSourceNode | null {
    if (!this.samples) return null;

    // play the sound
    const playbackRate =
      pitch + pitch * this.randomness * randomnessScale * (Math.random() * 2 - 1);
    this.source = ZZFX.playSamples([this.samples], volume, playbackRate, pan, loop);
    return this.source;
  }
}
