#!/usr/bin/env python3
"""
make-music.py — procedural 50-second entrance theme for AshLane promo videos.
Original composition, synthesized with numpy. No copyrighted material.
Heavy minor-key groove: drone intro -> main riff -> breakdown -> final hit.

Usage: python3 make-music.py --out theme.wav [--dur 50] [--seed 7]
"""
import argparse, numpy as np, wave, struct

SR = 44100

def env_ad(n, a, d):
    e = np.ones(n)
    na = max(1, int(n * a)); nd = max(1, int(n * d))
    e[:na] = np.linspace(0, 1, na)
    if nd < n: e[-nd:] = np.linspace(1, 0, nd)
    return e

def kick(t):
    # pitch-swept sine thump
    f0, f1 = 150, 42
    ph = 2 * np.pi * (f1 * t + (f0 - f1) * (1 - np.exp(-t * 30)) / 30)
    return np.sin(ph) * np.exp(-t * 9) * env_ad(len(t), 0.002, 0.6)

def snare(t, rng):
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
    noise = rng.standard_normal(len(t)) * np.exp(-t * 18)
    return (tone * 0.5 + noise * 0.5) * env_ad(len(t), 0.001, 0.7)

def hat(t, rng, open_=False):
    noise = rng.standard_normal(len(t))
    # highpass-ish: differentiate
    hp = np.diff(noise, prepend=0)
    dec = 25 if open_ else 60
    return hp * np.exp(-t * dec) * 0.35

def bass_note(freq, t):
    # saw-ish stack with sub
    s = (np.sin(2*np.pi*freq*t) * 0.5 + np.sin(2*np.pi*freq*2*t) * 0.25
         + np.sin(2*np.pi*freq*0.5*t) * 0.6 + np.sign(np.sin(2*np.pi*freq*t)) * 0.15)
    return np.tanh(s * 1.6) * env_ad(len(t), 0.01, 0.25)

def stab(freqs, t):
    s = np.zeros_like(t)
    for f in freqs:
        s += np.sin(2*np.pi*f*t) + 0.4*np.sin(2*np.pi*f*2.01*t)
    s = np.tanh(s * 0.8)
    return s * env_ad(len(t), 0.005, 0.55)

def pad_chord(freqs, t):
    s = np.zeros_like(t)
    for f in freqs:
        s += np.sin(2*np.pi*f*t + 0.3) * 0.3 + np.sin(2*np.pi*f*1.005*t) * 0.3
    return np.tanh(s) * 0.5

def riser(t):
    rng = np.random.default_rng(3)
    noise = rng.standard_normal(len(t))
    swell = (t / t[-1]) ** 2
    # bandpass sweep feel via cumulative
    return noise * swell * 0.35 * env_ad(len(t), 0.0, 0.05)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='theme.wav')
    ap.add_argument('--dur', type=float, default=50)
    ap.add_argument('--seed', type=int, default=7)
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed)
    n = int(SR * a.dur)
    mix = np.zeros(n)
    tt = np.arange(n) / SR

    bpm = 92
    beat = 60 / bpm
    bar = beat * 4

    def add(sig, at):
        i0 = int(at * SR)
        i1 = min(n, i0 + len(sig))
        if i1 > i0: mix[i0:i1] += sig[:i1-i0]

    def note_len(sec): return np.arange(int(SR*sec)) / SR

    # ---- 0-5s: dark drone + heartbeat + riser ----
    drone = pad_chord([55, 65.4, 82.4], note_len(6.0)) * 0.5
    add(drone, 0)
    for hb in [0.4, 1.05, 2.0, 2.65, 3.6, 4.25]:
        add(kick(note_len(0.5)) * 0.9, hb)
    add(riser(note_len(4.6)), 0.4)

    # ---- main groove 5-38s ----
    # bass riff in A minor: A1 A1 C2 A1 | G1 A1 E2 D2 (roots)
    riff = [55, 55, 65.41, 55, 49, 55, 82.41, 73.42]
    t_cur = 5.0
    bi = 0
    while t_cur < 37.6:
        bl = beat * 0.95
        add(bass_note(riff[bi % len(riff)], note_len(bl)) * 0.85, t_cur)
        # kick: four on floor with extra
        add(kick(note_len(0.45)), t_cur)
        if bi % 2 == 1: add(kick(note_len(0.45)) * 0.7, t_cur + beat * 0.5)
        # snare on 2 & 4
        if bi % 2 == 1: add(snare(note_len(0.35), rng) * 0.8, t_cur)
        # hats 8ths
        for h in range(2):
            add(hat(note_len(0.12), rng) * 0.8, t_cur + h * beat * 0.5)
        # synth stab every 2 bars
        if bi % 8 == 4:
            add(stab([220, 261.6, 329.6], note_len(0.6)) * 0.4, t_cur)
        t_cur += beat
        bi += 1

    # choir-ish pad swells under groove
    for ps, chord in [(5, [110, 130.8, 164.8]), (13, [98, 123.5, 146.8]),
                      (21, [110, 130.8, 164.8]), (29, [87.3, 110, 130.8])]:
        add(pad_chord(chord, note_len(8.2)) * 0.35, ps)

    # ---- breakdown 38-46s: half-time big hits ----
    for i, ht in enumerate([38.0, 39.6, 41.2, 42.8, 44.4]):
        add(kick(note_len(0.7)) * 1.2, ht)
        add(snare(note_len(0.6), rng) * 1.0, ht + 0.02)
        add(stab([110, 138.6, 164.8, 220], note_len(1.4)) * 0.55, ht)
        add(bass_note(55 if i % 2 == 0 else 49, note_len(1.2)) * 0.9, ht)

    # ---- final hit 46s + tail ----
    add(kick(note_len(1.0)) * 1.3, 46.0)
    add(stab([55, 82.5, 110, 165, 220], note_len(3.6)) * 0.7, 46.0)
    add(pad_chord([55, 65.4, 82.4, 110], note_len(4.0)) * 0.4, 46.0)

    # master: soft clip + fade out + normalize
    mix = np.tanh(mix * 0.9)
    fade = int(SR * 1.5)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix *= 0.89 / max(1e-6, np.abs(mix).max())
    pcm = (mix * 32767).astype(np.int16)

    with wave.open(a.out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'wrote {a.out} ({a.dur}s, peak {np.abs(mix).max():.2f})')

if __name__ == '__main__':
    main()
