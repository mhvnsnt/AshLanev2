/**
 * ASHLANE menu v4 — AAA street-brawler menu art.
 *
 * Owner verdict on v3: still too generic. v4 brings:
 * - Real roster portraits (public/portraits/*.webp) in fighter cards + hero
 * - SWMG hooded figures woven into painted street-scene backgrounds
 * - Layered, textured environments: brick, chain-link, wheatpaste, neon
 * - Detail density: stickers, ornamental dividers, swatches, layered cards
 * - Palette kept: blood red #c1121f, toxic green #a3e635, gold #d4af37
 *
 * SEE-don't-guess: every screen gets harness screenshots before ship.
 */

import { useEffect, useState } from "react";
import { assetUrl } from "./asset-base";
import { portraitFor, actionPortraitFor, HERO_ROTATION } from "./fighter-art";
import { FighterPortrait } from "./fighter-portraits";
import { ROSTER } from "./roster";
import type { FactionId } from "./char-gen";

/* ------------------------------------------------------------------ */
/* StreetScene — painted alley backdrop, layered SVG                    */
/* ------------------------------------------------------------------ */

/**
 * A painted back-alley: brick wall, chain-link, wheatpaste posters,
 * spray tags, neon, fire escape, hooded SWMG watchers, wet asphalt.
 * Rendered once per menu screen behind the content (aria-hidden).
 */
export function StreetScene({ seed = 7, className = "" }: { seed?: number; className?: string }) {
  // deterministic pseudo-random from seed for tag placement variety
  const rnd = (n: number) => {
    const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const tags = ["ASHLANE", "SWMG", "CONCRETE", "JUNGLE", "THE LANE", "NO MERCY"];
  const tag = tags[Math.floor(rnd(1) * tags.length)];
  const tag2 = tags[Math.floor(rnd(2) * tags.length)];

  return (
    <div className={`v4-scene ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 620" preserveAspectRatio="xMidYMid slice" className="v4-scene-svg">
        <defs>
          <linearGradient id={`v4sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a0910" />
            <stop offset="0.55" stopColor="#12101c" />
            <stop offset="1" stopColor="#1a1420" />
          </linearGradient>
          <linearGradient id={`v4wall-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#241d18" />
            <stop offset="1" stopColor="#17120e" />
          </linearGradient>
          <linearGradient id={`v4asphalt-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c1917" />
            <stop offset="1" stopColor="#0b0a09" />
          </linearGradient>
          <radialGradient id={`v4neon-g-${seed}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#a3e635" stopOpacity="0.55" />
            <stop offset="1" stopColor="#a3e635" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`v4neon-p-${seed}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#7b2ff7" stopOpacity="0.5" />
            <stop offset="1" stopColor="#7b2ff7" stopOpacity="0" />
          </radialGradient>
          <pattern id={`v4brick-${seed}`} width="64" height="32" patternUnits="userSpaceOnUse">
            <rect width="64" height="32" fill="none" />
            <rect x="1" y="1" width="30" height="14" fill="#2b211b" opacity="0.9" />
            <rect x="33" y="1" width="30" height="14" fill="#271e18" opacity="0.9" />
            <rect x="-15" y="17" width="30" height="14" fill="#2b211b" opacity="0.9" />
            <rect x="17" y="17" width="30" height="14" fill="#241c16" opacity="0.9" />
            <rect x="49" y="17" width="30" height="14" fill="#2b211b" opacity="0.9" />
          </pattern>
          <pattern id={`v4chain-${seed}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M0 18 L18 0 M-4 4 L4 -4 M14 22 L22 14" stroke="#3a3f45" strokeWidth="1.6" opacity="0.85" />
            <path d="M0 0 L18 18 M-4 14 L4 22 M14 -4 L22 4" stroke="#2c3036" strokeWidth="1.6" opacity="0.85" />
          </pattern>
        </defs>

        {/* sky + distant blocks */}
        <rect width="800" height="620" fill={`url(#v4sky-${seed})`} />
        <g opacity="0.8">
          <rect x="40" y="60" width="90" height="200" fill="#0d0b12" />
          <rect x="150" y="30" width="70" height="230" fill="#0e0c14" />
          <rect x="620" y="50" width="110" height="210" fill="#0d0b12" />
          <rect x="540" y="90" width="60" height="170" fill="#0e0c14" />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={i}
              x={45 + rnd(i + 10) * 680}
              y={70 + rnd(i + 40) * 150}
              width="7"
              height="10"
              fill={rnd(i + 70) > 0.6 ? "#d4af37" : "#7b2ff7"}
              opacity={0.25 + rnd(i + 90) * 0.5}
            />
          ))}
        </g>
        <ellipse cx="180" cy="150" rx="220" ry="120" fill={`url(#v4neon-p-${seed})`} />
        <ellipse cx="640" cy="200" rx="200" ry="110" fill={`url(#v4neon-g-${seed})`} />

        {/* brick wall */}
        <rect x="0" y="180" width="800" height="300" fill={`url(#v4wall-${seed})`} />
        <rect x="0" y="180" width="800" height="300" fill={`url(#v4brick-${seed})`} opacity="0.55" />
        {/* grime + cracks */}
        <g opacity="0.5">
          <path d="M120 180 q10 60 -8 120 q-6 80 4 180" stroke="#0d0a08" strokeWidth="14" fill="none" opacity="0.6" />
          <path d="M690 180 q-12 70 6 130 q8 90 -4 170" stroke="#0d0a08" strokeWidth="18" fill="none" opacity="0.55" />
          <path d="M330 190 l24 60 l-14 44 l20 70" stroke="#0a0806" strokeWidth="2.5" fill="none" opacity="0.8" />
          <path d="M520 185 l-18 80 l16 50" stroke="#0a0806" strokeWidth="2" fill="none" opacity="0.7" />
        </g>

        {/* wheatpaste posters */}
        <g>
          <g transform="rotate(-4 200 300)">
            <rect x="150" y="240" width="100" height="130" fill="#cfc4a8" opacity="0.92" />
            <rect x="150" y="240" width="100" height="130" fill="none" stroke="#0a0806" strokeWidth="2" opacity="0.4" />
            <rect x="160" y="252" width="80" height="34" fill="#c1121f" opacity="0.85" />
            <text x="200" y="276" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="17" fill="#f5efe0">FIGHT</text>
            <text x="200" y="300" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#2a241e">NIGHT · THE PIT</text>
            <text x="200" y="330" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#2a241e">WINNER TAKES</text>
            <text x="200" y="344" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#2a241e">THE BLOCK</text>
            <path d="M150 340 l100 -14 l0 44 l-100 8 z" fill="#b8ab8c" opacity="0.9" />
          </g>
          <g transform="rotate(3 590 320)">
            <rect x="545" y="255" width="90" height="120" fill="#b9b2a0" opacity="0.88" />
            <rect x="545" y="255" width="90" height="120" fill="none" stroke="#0a0806" strokeWidth="2" opacity="0.4" />
            <circle cx="590" cy="295" r="22" fill="none" stroke="#1c1814" strokeWidth="3" />
            <text x="590" y="300" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="13" fill="#1c1814">$</text>
            <text x="590" y="340" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#2a241e">MONEY GANG</text>
            <path d="M545 300 l90 10 l-6 65 l-84 -8 z" fill="#8f887a" opacity="0.85" />
          </g>
          <g transform="rotate(-2 420 290)">
            <rect x="380" y="240" width="80" height="100" fill="#d8cdb2" opacity="0.8" />
            <text x="420" y="290" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="#3a2a1a">MISSING</text>
            <text x="420" y="308" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#3a2a1a">HAVE YOU SEEN</text>
            <text x="420" y="322" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#3a2a1a">THIS WIZARD?</text>
          </g>
        </g>

        {/* spray tags */}
        <g opacity="0.9">
          <text x="400" y="430" textAnchor="middle" fontFamily="'Rubik Spray Paint','Permanent Marker',cursive"
            fontSize="64" fill="#c1121f" opacity="0.75" transform="rotate(-3 400 430)">{tag}</text>
          <text x="130" y="250" fontFamily="'Permanent Marker',cursive" fontSize="26" fill="#a3e635"
            opacity="0.7" transform="rotate(-8 130 250)">{tag2}</text>
          <text x="700" y="420" fontFamily="'Permanent Marker',cursive" fontSize="22" fill="#d4af37"
            opacity="0.65" transform="rotate(5 700 420)">182</text>
        </g>

        {/* chain-link fence */}
        <rect x="0" y="360" width="800" height="120" fill={`url(#v4chain-${seed})`} opacity="0.5" />
        <rect x="0" y="360" width="800" height="6" fill="#22252a" opacity="0.9" />
        <rect x="0" y="474" width="800" height="6" fill="#22252a" opacity="0.9" />

        {/* fire escape silhouette */}
        <g stroke="#0c0a09" strokeWidth="7" opacity="0.95">
          <line x1="740" y1="180" x2="740" y2="420" />
          <line x1="790" y1="180" x2="790" y2="420" />
          <line x1="726" y1="250" x2="790" y2="250" />
          <line x1="726" y1="330" x2="790" y2="330" />
          <line x1="726" y1="410" x2="790" y2="410" />
          <line x1="740" y1="250" x2="790" y2="330" strokeWidth="4" />
          <line x1="790" y1="250" x2="740" y2="330" strokeWidth="4" />
        </g>

        {/* neon sign */}
        <g>
          <ellipse cx="105" cy="215" rx="90" ry="40" fill={`url(#v4neon-g-${seed})`} />
          <rect x="55" y="195" width="100" height="40" rx="6" fill="#0d0f0a" stroke="#a3e635" strokeWidth="2.5" opacity="0.95" />
          <text x="105" y="222" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="22"
            fill="#a3e635" opacity="0.95">OPEN</text>
        </g>

        {/* SWMG hooded watchers in the scene */}
        <g>
          <g transform="translate(255 395)">
            <path d="M-26 90 Q-30 30 -12 10 Q0 -4 12 10 Q30 30 26 90 Z" fill="#14101c" opacity="0.96" />
            <ellipse cx="0" cy="34" rx="13" ry="15" fill="#000000" />
            <circle cx="-4.5" cy="32" r="1.8" fill="#e8f4ff" opacity="0.95" />
            <circle cx="4.5" cy="32" r="1.8" fill="#e8f4ff" opacity="0.95" />
            <path d="M-26 90 L26 90" stroke="#d4af37" strokeWidth="2" opacity="0.5" />
          </g>
          <g transform="translate(560 405) scale(-1 1)">
            <path d="M-24 84 Q-28 28 -11 9 Q0 -4 11 9 Q28 28 24 84 Z" fill="#100d18" opacity="0.96" />
            <ellipse cx="0" cy="31" rx="12" ry="14" fill="#000000" />
            <circle cx="-4" cy="29" r="1.7" fill="#e8f4ff" opacity="0.95" />
            <circle cx="4" cy="29" r="1.7" fill="#e8f4ff" opacity="0.95" />
          </g>
          <g transform="translate(700 300) scale(0.7)">
            <path d="M-26 90 Q-30 30 -12 10 Q0 -4 12 10 Q30 30 26 90 Z" fill="#121020" opacity="0.9" />
            <ellipse cx="0" cy="34" rx="13" ry="15" fill="#000000" />
            <circle cx="-4.5" cy="32" r="1.8" fill="#cfe8ff" opacity="0.9" />
            <circle cx="4.5" cy="32" r="1.8" fill="#cfe8ff" opacity="0.9" />
          </g>
        </g>

        {/* hanging gold chain */}
        <g opacity="0.85">
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse key={i} cx={400 + (i % 2 ? 7 : -7)} cy={186 + i * 13} rx="9" ry="6.5"
              fill="none" stroke="#d4af37" strokeWidth="3.2" opacity={0.85 - i * 0.06} />
          ))}
        </g>

        {/* wet asphalt + reflections */}
        <rect x="0" y="480" width="800" height="140" fill={`url(#v4asphalt-${seed})`} />
        <g opacity="0.35">
          <ellipse cx="105" cy="540" rx="70" ry="10" fill="#a3e635" opacity="0.5" />
          <ellipse cx="640" cy="555" rx="90" ry="12" fill="#7b2ff7" opacity="0.45" />
          <ellipse cx="400" cy="570" rx="60" ry="8" fill="#c1121f" opacity="0.4" />
          {Array.from({ length: 20 }).map((_, i) => (
            <rect key={i} x={rnd(i + 200) * 780} y={495 + rnd(i + 300) * 110}
              width={20 + rnd(i + 400) * 60} height="2.5" fill="#6a6f78" opacity={0.25} />
          ))}
        </g>

        {/* vignette */}
        <rect width="800" height="620" fill="black" opacity="0.28" />
      </svg>
      <div className="v4-scene-grain" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FighterSelectCard — Def Jam-grade fighter card with REAL art          */
/* ------------------------------------------------------------------ */

export interface FighterCardData {
  id: string;
  name: string;
  martial: string;
  bio: string;
}

export function FighterSelectCard({
  fighter,
  selected,
  onSelect,
  factionEmblem,
  stats,
}: {
  fighter: FighterCardData;
  selected: boolean;
  onSelect: () => void;
  factionEmblem: React.ReactNode;
  stats: { pow: number; spd: number; tgh: number };
}) {
  const src = portraitFor(fighter.id);
  return (
    <button
      type="button"
      data-on={selected ? "1" : undefined}
      className="v4-fcard"
      onClick={onSelect}
      aria-label={`Select ${fighter.name}`}
    >
      <span className="v4-fcard-art" aria-hidden="true">
        {src ? (
          <img src={src} alt="" loading="lazy" draggable={false} />
        ) : (
          <span className="v4-fcard-proc">
            <FighterPortrait fighterId={fighter.id} name={fighter.name} size={200} />
          </span>
        )}
        <span className="v4-fcard-shade" />
        <span className="v4-fcard-style">{fighter.martial}</span>
      </span>
      <span className="v4-fcard-plate">
        <span className="v4-fcard-name">{fighter.name}</span>
        <span className="v4-fcard-row">
          {factionEmblem}
          <span className="v4-stat" aria-hidden="true">
            <span className="v4-stat-row"><i>POW</i><b><u style={{ width: `${stats.pow * 100}%` }} /></b></span>
            <span className="v4-stat-row"><i>SPD</i><b><u className="cool" style={{ width: `${stats.spd * 100}%` }} /></b></span>
            <span className="v4-stat-row"><i>TGH</i><b><u style={{ width: `${stats.tgh * 100}%` }} /></b></span>
          </span>
        </span>
      </span>
      {selected ? <span className="v4-fcard-pick">IN</span> : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* MenuHero — featured fighter strip on the main menu                   */
/* ------------------------------------------------------------------ */

export function MenuHero({ onPick }: { onPick: (id: string) => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_ROTATION.length), 5000);
    return () => clearInterval(t);
  }, []);
  const fid = HERO_ROTATION[idx];
  const src = actionPortraitFor(fid) ?? portraitFor(fid);
  const name = ROSTER.find((f) => f.id === fid)?.name ?? fid;
  return (
    <div className="v4-hero" aria-hidden="true">
      <div className="v4-hero-art" key={fid}>
        {src ? <img src={src} alt="" loading="lazy" draggable={false} /> : null}
        <div className="v4-hero-shade" />
      </div>
      <div className="v4-hero-copy">
        <span className="v4-hero-kicker">Featured fighter</span>
        <span className="v4-hero-name">{name}</span>
        <button
          type="button"
          className="v4-hero-cta"
          aria-hidden="true"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onPick(fid); }}
        >
          Run it
        </button>
      </div>
      <div className="v4-hero-dots">
        {HERO_ROTATION.map((id, i) => (
          <i key={id} data-on={i === idx ? "1" : undefined} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ornaments — dividers, stickers, swatches                             */
/* ------------------------------------------------------------------ */

export function ChainDivider({ label }: { label?: string }) {
  return (
    <div className="v4-chain-div" aria-hidden="true">
      <span className="v4-chain-links">
        {Array.from({ length: 24 }).map((_, i) => <i key={i} />)}
      </span>
      {label ? <span className="v4-chain-label">{label}</span> : null}
      <span className="v4-chain-links">
        {Array.from({ length: 24 }).map((_, i) => <i key={i} />)}
      </span>
    </div>
  );
}

export function Sticker({ text, tone = "blood", rotate = -8 }: { text: string; tone?: "blood" | "gold" | "toxic"; rotate?: number }) {
  return (
    <span className={`v4-sticker v4-sticker-${tone}`} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      {text}
    </span>
  );
}

export function SwatchBar() {
  return (
    <div className="v4-swatches" aria-hidden="true">
      <i style={{ background: "#c1121f" }} title="blood" />
      <i style={{ background: "#7a0c14" }} title="blood dark" />
      <i style={{ background: "#a3e635" }} title="toxic" />
      <i style={{ background: "#7b2ff7" }} title="purple" />
      <i style={{ background: "#d4af37" }} title="gold" />
      <i style={{ background: "#e8e0d0" }} title="chalk" />
      <i style={{ background: "#141210" }} title="asphalt" />
    </div>
  );
}

/** Corner tape strips for layering on cards/panels. */
export function TapeCorners() {
  return (
    <span className="v4-tape-corners" aria-hidden="true">
      <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
    </span>
  );
}

/** Pre-fight VS splash using real portraits when available. */
export function VsSplash({ leftId, leftName, rightId, rightName }: {
  leftId: string; leftName: string; rightId: string; rightName: string;
}) {
  const l = portraitFor(leftId);
  const r = portraitFor(rightId);
  return (
    <div className="v4-vs" aria-hidden="true">
      <div className="v4-vs-side left">
        {l ? <img src={l} alt="" draggable={false} /> : <FighterPortrait fighterId={leftId} name={leftName} size={220} />}
        <span>{leftName}</span>
      </div>
      <div className="v4-vs-mid">VS</div>
      <div className="v4-vs-side right">
        {r ? <img src={r} alt="" draggable={false} /> : <FighterPortrait fighterId={rightId} name={rightName} size={220} />}
        <span>{rightName}</span>
      </div>
    </div>
  );
}

/** Menu logo lockup asset path helper (v3 PNGs in public/art). */
export function logoVariant(variant: "red" | "white" | "yellow"): string {
  return assetUrl(`art/ashlane-logo-${variant}.png`);
}
