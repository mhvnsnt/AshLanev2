/**
 * ASHLANE STREET KIT — hand-built SVG art library.
 * Gritty street-level urban brawler aesthetic. NOT cyberpunk.
 * Graffiti tags, spray paint, tape, stencils, torn edges, concrete.
 *
 * All components are pure SVG, no external assets, theme-aware via CSS vars.
 */

import { useId } from "react";

/* ============================================================
   ASHLANE LOGO V2 — graffiti tag wordmark
   Raw spray-paint tag, tilted, with drips and overspray.
   ============================================================ */

export function AshlaneTag({
  className = "",
  variant = "red",
}: {
  className?: string;
  variant?: "red" | "white" | "yellow";
}) {
  const uid = useId().replace(/:/g, "");
  const colors = {
    red: { main: "#c1121f", dark: "#7a0c14", spray: "#e5383b" },
    white: { main: "#e8e0d0", dark: "#a89880", spray: "#f5f0e0" },
    yellow: { main: "#d9a021", dark: "#8a6410", spray: "#f0b429" },
  }[variant];

  return (
    <svg viewBox="0 0 680 200" className={className} role="img" aria-label="Ashlane">
      <defs>
        <filter id={`spray-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
        </filter>
        <filter id={`rough-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="8" />
        </filter>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.spray} stopOpacity="0.30" />
          <stop offset="65%" stopColor={colors.spray} stopOpacity="0.12" />
          <stop offset="100%" stopColor={colors.spray} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* overspray halo — soft spray fade, not a solid egg */}
      <ellipse cx="340" cy="100" rx="280" ry="62" fill={`url(#halo-${uid})`} filter={`url(#spray-${uid})`} />

      {/* main tag — hand-drawn graffiti letterforms */}
      <g
        filter={`url(#rough-${uid})`}
        transform="rotate(-3 340 100)"
        fontFamily="'Rubik Spray Paint', 'Permanent Marker', Impact, sans-serif"
      >
        <text
          x="340"
          y="128"
          textAnchor="middle"
          fontSize="110"
          fontWeight="400"
          letterSpacing="4"
          fill={colors.main}
          stroke={colors.dark}
          strokeWidth="2"
        >
          ASHLANE
        </text>
        {/* highlight drips */}
        <text
          x="340"
          y="128"
          textAnchor="middle"
          fontSize="110"
          letterSpacing="4"
          fill="none"
          stroke={colors.spray}
          strokeWidth="0.8"
          opacity="0.4"
          transform="translate(-2 -3)"
        >
          ASHLANE
        </text>
      </g>

      {/* paint drips from letters */}
      <g fill={colors.main} opacity="0.85">
        <rect x="185" y="132" width="5" height="28" rx="2.5" />
        <rect x="312" y="130" width="4" height="38" rx="2" />
        <rect x="418" y="134" width="6" height="22" rx="3" />
        <rect x="498" y="131" width="4" height="32" rx="2" />
        <circle cx="187.5" cy="162" r="3.5" />
        <circle cx="314" cy="170" r="3" />
        <circle cx="500" cy="165" r="2.8" />
      </g>

      {/* spray splatter accents */}
      <g fill={colors.spray} opacity="0.6">
        <circle cx="72" cy="52" r="8" />
        <circle cx="95" cy="68" r="4" />
        <circle cx="58" cy="78" r="3" />
        <circle cx="608" cy="148" r="9" />
        <circle cx="630" cy="128" r="4" />
        <circle cx="590" cy="162" r="3" />
        <ellipse cx="120" cy="160" rx="14" ry="6" transform="rotate(-15 120 160)" />
        <ellipse cx="560" cy="42" rx="16" ry="7" transform="rotate(12 560 42)" />
      </g>

      {/* tagger's underline swoosh */}
      <path
        d="M80 158 C 220 172, 460 172, 600 150"
        fill="none"
        stroke={colors.main}
        strokeWidth="7"
        strokeLinecap="round"
        filter={`url(#spray-${uid})`}
        opacity="0.9"
      />
      <path
        d="M580 148 C 600 146, 615 142, 628 134"
        fill="none"
        stroke={colors.main}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

/* ============================================================
   SPRAY SPLATTER — paint splatter decoration
   ============================================================ */

export function SpraySplatter({
  className = "",
  color = "#c1121f",
  seed = 1,
}: {
  className?: string;
  color?: string;
  seed?: number;
}) {
  // Deterministic pseudo-random splatter from seed
  let h = seed * 7919;
  const r = () => {
    h = (Math.imul(h ^ (h >>> 15), 1 | h) + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 7), 61 | h) ^ h;
    return (((t ^ (t >>> 14)) >>> 0) % 1000) / 1000;
  };
  const blobs = Array.from({ length: 14 }, () => ({
    cx: 20 + r() * 160,
    cy: 20 + r() * 80,
    rx: 3 + r() * 18,
    ry: 2 + r() * 10,
    rot: r() * 360,
    op: 0.35 + r() * 0.5,
  }));
  const dots = Array.from({ length: 10 }, () => ({
    cx: r() * 200,
    cy: r() * 120,
    r: 1 + r() * 4,
    op: 0.3 + r() * 0.5,
  }));

  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g fill={color}>
        {blobs.map((b, i) => (
          <ellipse
            key={i}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}
            opacity={b.op}
          />
        ))}
        {dots.map((d, i) => (
          <circle key={`d${i}`} cx={d.cx} cy={d.cy} r={d.r} opacity={d.op} />
        ))}
      </g>
    </svg>
  );
}

/* ============================================================
   TAPE STRIP — masking tape / duct tape piece
   ============================================================ */

export function TapeStrip({
  className = "",
  color = "#d8c9a8",
  angle = -4,
  label,
}: {
  className?: string;
  color?: string;
  angle?: number;
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 220 44" className={className} aria-hidden="true">
      <defs>
        <filter id={`tape-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
      </defs>
      <g transform={`rotate(${angle} 110 22)`} filter={`url(#tape-${uid})`}>
        {/* torn left edge */}
        <polygon
          points="8,4 14,10 6,16 12,22 6,28 13,34 7,40 212,40 206,34 214,28 208,22 214,16 206,10 213,4"
          fill={color}
          opacity="0.92"
        />
        {/* tape texture lines */}
        <g stroke="#000" strokeWidth="0.5" opacity="0.12">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={20 + i * 24} y1="6" x2={20 + i * 24} y2="38" />
          ))}
        </g>
        {label ? (
          <text
            x="110"
            y="28"
            textAnchor="middle"
            style={{ fontFamily: "'Black Ops One',monospace", fontSize: 16, letterSpacing: 3 }}
            fill="#2a2521"
            opacity="0.75"
          >
            {label}
          </text>
        ) : null}
      </g>
    </svg>
  );
}

/* ============================================================
   STENCIL TAG — military/street stencil text
   ============================================================ */

export function StencilTag({
  text,
  className = "",
  color = "#e8e0d0",
}: {
  text: string;
  className?: string;
  color?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 300 60" className={className} role="img" aria-label={text}>
      <defs>
        <filter id={`stencil-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" />
          <feComposite in2="SourceGraphic" operator="in" result="eroded" />
        </filter>
      </defs>
      {/* spray behind */}
      <rect x="10" y="8" width="280" height="44" fill={color} opacity="0.14" filter={`url(#stencil-${uid})`} />
      <text
        x="150"
        y="42"
        textAnchor="middle"
        style={{ fontFamily: "'Black Ops One','Anton',sans-serif", fontSize: 34, letterSpacing: 6 }}
        fill={color}
        opacity="0.88"
        filter={`url(#stencil-${uid})`}
      >
        {text}
      </text>
    </svg>
  );
}

/* ============================================================
   TORN EDGE DIVIDER — ripped paper / torn metal
   ============================================================ */

export function TornEdge({
  className = "",
  color = "#c1121f",
  flip = false,
}: {
  className?: string;
  color?: string;
  flip?: boolean;
}) {
  // Generate jagged tear path deterministically
  let h = 12345;
  const r = () => {
    h = (Math.imul(h ^ (h >>> 15), 1 | h) + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 7), 61 | h) ^ h;
    return (((t ^ (t >>> 14)) >>> 0) % 1000) / 1000;
  };
  const teeth: string[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 600;
    const y = 8 + r() * 16;
    teeth.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const path = `M0,0 L600,0 L600,8 ${teeth.map((t) => `L${t}`).reverse().join(" ")} L0,8 Z`;

  return (
    <svg
      viewBox="0 0 600 26"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path d={path} fill={color} opacity="0.9" />
      {/* dark underside shadow */}
      <path d={path} fill="#000" opacity="0.35" transform="translate(0 2)" />
    </svg>
  );
}

/* ============================================================
   CHAIN LINK — chain-link fence segment
   ============================================================ */

export function ChainLink({
  className = "",
  color = "#6b6560",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 200 60" className={className} aria-hidden="true">
      <defs>
        <pattern id="chainlink-pat" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M0,20 L20,0 M-5,5 L5,-5 M15,25 L25,15 M0,0 L20,20 M-5,15 L5,25 M15,-5 L25,5"
            stroke={color}
            strokeWidth="1.6"
            opacity="0.5"
          />
        </pattern>
      </defs>
      <rect width="200" height="60" fill="url(#chainlink-pat)" />
      {/* top rail */}
      <rect x="0" y="0" width="200" height="4" fill={color} opacity="0.7" />
    </svg>
  );
}

/* ============================================================
   BRICK WALL — brick texture strip
   ============================================================ */

export function BrickWall({
  className = "",
  mortar = "#2a2521",
  brick = "#4a3a30",
}: {
  className?: string;
  mortar?: string;
  brick?: string;
}) {
  const rows = 4;
  const bw = 50;
  const bh = 22;
  const bricks: { x: number; y: number; w: number }[] = [];
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : -bw / 2;
    for (let x = offset; x < 400; x += bw) {
      // deterministic shade variation
      const shade = ((row * 7 + Math.round(x / bw)) % 3) * 0.06;
      bricks.push({ x, y: row * (bh + 3), w: bw - 3 });
      void shade;
    }
  }
  return (
    <svg viewBox="0 0 400 100" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="100" fill={mortar} />
      {bricks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={bh}
          fill={brick}
          opacity={0.75 + ((i * 13) % 5) * 0.05}
        />
      ))}
      {/* grime */}
      <rect width="400" height="100" fill="#000" opacity="0.25" />
    </svg>
  );
}

/* ============================================================
   CORNER BRACKET — worn metal corner ornament
   ============================================================ */

export function CornerBracket({
  className = "",
  color = "#d9a021",
  position = "tl",
}: {
  className?: string;
  color?: string;
  position?: "tl" | "tr" | "bl" | "br";
}) {
  const transforms = {
    tl: "",
    tr: "scale(-1 1) translate(-60 0)",
    bl: "scale(1 -1) translate(0 -60)",
    br: "scale(-1 -1) translate(-60 -60)",
  };
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      <g transform={transforms[position]}>
        <path
          d="M4,56 L4,16 Q4,4 16,4 L56,4"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="square"
          opacity="0.9"
        />
        {/* rivets */}
        <circle cx="12" cy="12" r="2.5" fill={color} opacity="0.7" />
        <circle cx="12" cy="48" r="2.5" fill={color} opacity="0.5" />
        <circle cx="48" cy="12" r="2.5" fill={color} opacity="0.5" />
        {/* wear */}
        <path d="M4,30 L4,44" stroke="#000" strokeWidth="5" opacity="0.3" />
      </g>
    </svg>
  );
}

/* ============================================================
   SPRAY ARROW — graffiti direction arrow
   ============================================================ */

export function SprayArrow({
  className = "",
  color = "#e8e0d0",
  direction = "right",
}: {
  className?: string;
  color?: string;
  direction?: "right" | "left" | "up" | "down";
}) {
  const rotations = { right: 0, down: 90, left: 180, up: 270 };
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden="true">
      <defs>
        <filter id={`arrow-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
        </filter>
      </defs>
      <g transform={`rotate(${rotations[direction]} 60 30)`} filter={`url(#arrow-${uid})`}>
        <path
          d="M8,26 L78,26 L78,14 L112,30 L78,46 L78,34 L8,34 Z"
          fill={color}
          opacity="0.9"
        />
        {/* overspray */}
        <ellipse cx="60" cy="30" rx="52" ry="18" fill={color} opacity="0.15" />
      </g>
    </svg>
  );
}

/* ============================================================
   CAUTION TAPE — worn hazard tape strip
   ============================================================ */

export function CautionTape({
  className = "",
}: {
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 28" className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id={`worn-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" />
        </filter>
      </defs>
      <g filter={`url(#worn-${uid})`}>
        <rect width="400" height="28" fill="#d9a021" opacity="0.85" />
        {Array.from({ length: 10 }, (_, i) => (
          <polygon
            key={i}
            points={`${i * 40},0 ${i * 40 + 20},0 ${i * 40},28 ${i * 40 - 20},28`}
            fill="#141210"
            opacity="0.85"
          />
        ))}
        {/* wear patches */}
        <rect x="60" y="0" width="34" height="28" fill="#141210" opacity="0.25" />
        <rect x="240" y="0" width="52" height="28" fill="#141210" opacity="0.2" />
        <rect x="330" y="0" width="22" height="28" fill="#e8e0d0" opacity="0.15" />
      </g>
    </svg>
  );
}

/* ============================================================
   FIST STENCIL — street brawler fist mark
   ============================================================ */

export function FistStencil({
  className = "",
  color = "#c1121f",
}: {
  className?: string;
  color?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <defs>
        <filter id={`fist-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
      </defs>
      <g fill={color} opacity="0.88" filter={`url(#fist-${uid})`}>
        {/* raised fist silhouette */}
        <path d="M28,62 L28,34 C28,28 32,24 38,24 L42,24 C48,24 52,28 52,34 L52,44 L56,44 C60,44 62,47 62,51 L62,56 C62,62 56,68 46,68 L38,68 C32,68 28,66 28,62 Z" />
        <rect x="30" y="14" width="8" height="16" rx="4" />
        <rect x="40" y="10" width="8" height="20" rx="4" />
        <rect x="50" y="14" width="8" height="16" rx="4" />
        <rect x="22" y="22" width="7" height="14" rx="3.5" transform="rotate(-18 25 29)" />
      </g>
    </svg>
  );
}
/* ============================================================
   SHADOW WIZARD MONEY GANG — underlying-theme art components.
   Malakor + SWMG is the world/atmosphere language under the
   Tekken/Urban Reign menu presentation: pitch black streets,
   hooded figures with tiny sparkly eye glints, gold-chain
   motifs, diamond-grill murals, spellbook graffiti.
   NOT literal fantasy — "wizards of the street" energy.
   ============================================================ */

/* ---------- EYE GLINTS — tiny sparkly white eyes in the dark ---------- */

export function EyeGlints({
  className = "",
  spots = [
    { x: 12, y: 30, d: 0 },
    { x: 68, y: 22, d: 1.4 },
    { x: 88, y: 58, d: 2.6 },
    { x: 30, y: 70, d: 3.8 },
    { x: 52, y: 48, d: 2 },
  ],
}: {
  className?: string;
  spots?: { x: number; y: number; d: number }[];
}) {
  return (
    <div className={`lane-eyes ${className}`} aria-hidden="true">
      {spots.map((s, i) => (
        <span
          key={i}
          className="lane-eye"
          style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }}
        />
      ))}
    </div>
  );
}

/* ---------- GOLD CHAIN — repeating chain-link strip ---------- */

export function GoldChain({
  className = "",
  color = "#d4af37",
  linkW = 26,
}: {
  className?: string;
  color?: string;
  linkW?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const links = Math.ceil(640 / linkW);
  return (
    <svg viewBox="0 0 640 26" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <filter id={`chain-${uid}`} x="-20%" y="-60%" width="140%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" />
        </filter>
      </defs>
      {/* top + bottom rails */}
      <rect x="0" y="2" width="640" height="3" fill={color} opacity="0.75" />
      <rect x="0" y="21" width="640" height="3" fill={color} opacity="0.75" />
      {/* interlocking oval links */}
      <g
        fill="none"
        stroke={color}
        strokeWidth="3.2"
        opacity="0.95"
        filter={`url(#chain-${uid})`}
      >
        {Array.from({ length: links }, (_, i) => (
          <ellipse
            key={i}
            cx={linkW / 2 + i * linkW}
            cy="13"
            rx={linkW * 0.34}
            ry="8.5"
            transform={`rotate(${i % 2 === 0 ? 24 : -24} ${linkW / 2 + i * linkW} 13)`}
          />
        ))}
      </g>
      {/* glints on a few links */}
      <g fill="#f5e9c8" opacity="0.8">
        {Array.from({ length: Math.ceil(links / 5) }, (_, i) => (
          <circle key={i} cx={linkW / 2 + i * linkW * 5} cy="8" r="1.6" />
        ))}
      </g>
    </svg>
  );
}

/* ---------- DIAMOND GRILL — SWMG mural wall panel ---------- */

export function DiamondGrill({
  className = "",
  color = "#d4af37",
  opacity = 0.16,
}: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <pattern id={`grill-${uid}`} width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M22,2 L42,22 L22,42 L2,22 Z" fill="none" stroke={color} strokeWidth="2.5" />
          <circle cx="22" cy="22" r="3" fill={color} />
        </pattern>
        <filter id={`grillrough-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
        </filter>
      </defs>
      <rect width="400" height="200" fill={`url(#grill-${uid})`} opacity={opacity} filter={`url(#grillrough-${uid})`} />
    </svg>
  );
}

/* ---------- HOODED FIGURE — face buried in black, eye glints ---------- */

export function HoodedFigure({
  className = "",
  flip = false,
  eyeDelay = 0,
}: {
  className?: string;
  flip?: boolean;
  eyeDelay?: number;
}) {
  return (
    <svg
      viewBox="0 0 120 220"
      className={className}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <radialGradient id="hood-rim" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#1a1426" />
          <stop offset="100%" stopColor="#05040a" />
        </radialGradient>
      </defs>
      {/* cloak body */}
      <path
        d="M60,8 C34,8 24,34 22,60 C20,92 12,140 6,220 L114,220 C108,140 100,92 98,60 C96,34 86,8 60,8 Z"
        fill="url(#hood-rim)"
      />
      {/* hood shadow over face */}
      <ellipse cx="60" cy="52" rx="30" ry="34" fill="#020204" />
      {/* hood rim light (purple, Malakor night) */}
      <path
        d="M32,40 C30,66 34,88 44,100"
        fill="none"
        stroke="#7b2ff7"
        strokeWidth="2"
        opacity="0.5"
      />
      <path
        d="M88,40 C90,66 86,88 76,100"
        fill="none"
        stroke="#7b2ff7"
        strokeWidth="2"
        opacity="0.35"
      />
      {/* tiny sparkly eye glints */}
      <g style={{ animation: "lane-eye-twinkle 5s ease-in-out infinite", animationDelay: `${eyeDelay}s` }}>
        <circle cx="50" cy="54" r="2.2" fill="#fff" />
        <circle cx="70" cy="54" r="2.2" fill="#fff" />
        <circle cx="50" cy="54" r="5" fill="#fff" opacity="0.25" />
        <circle cx="70" cy="54" r="5" fill="#fff" opacity="0.25" />
      </g>
      {/* gold chain across the chest */}
      <path
        d="M30,120 C48,132 72,132 90,120"
        fill="none"
        stroke="#d4af37"
        strokeWidth="4"
        strokeDasharray="7 4"
        opacity="0.9"
      />
      <circle cx="60" cy="130" r="6" fill="none" stroke="#d4af37" strokeWidth="3" />
      <circle cx="60" cy="130" r="2" fill="#d4af37" />
    </svg>
  );
}

/* ---------- SPELLBOOK TAG — street-slang graffiti with wizard glow ---------- */

export function SpellbookTag({
  className = "",
  text = "wizards of the street",
  color = "#a3e635",
  rotate = -3,
  size = "1.05rem",
}: {
  className?: string;
  text?: string;
  color?: string;
  rotate?: number;
  size?: string;
}) {
  return (
    <span
      className={`lane-spell ${className}`}
      style={{ color, fontSize: size, transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

/* ---------- WIZARD GLYPH — spell-circle sigil, street remix ---------- */

export function WizardGlyph({
  className = "",
  color = "#7b2ff7",
}: {
  className?: string;
  color?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <filter id={`glyph-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
      </defs>
      <g
        fill="none"
        stroke={color}
        opacity="0.85"
        filter={`url(#glyph-${uid})`}
      >
        <circle cx="60" cy="60" r="52" strokeWidth="3" />
        <circle cx="60" cy="60" r="44" strokeWidth="1.5" strokeDasharray="6 5" />
        <path d="M60,14 L74,46 L108,46 L80,66 L90,100 L60,79 L30,100 L40,66 L12,46 L46,46 Z" strokeWidth="2.5" />
      </g>
      {/* dollar-sign core — money magic */}
      <text
        x="60"
        y="74"
        textAnchor="middle"
        fontSize="34"
        fill="#d4af37"
        style={{ fontFamily: "'Anton', 'Arial Black', sans-serif" }}
        opacity="0.95"
      >
        $
      </text>
    </svg>
  );
}

/* ============================================================
   LANE BACKDROP — the Malakor/SWMG atmosphere layer.
   Rendered under menu content, over photographic MenuArt.
   pitch black + purple/green haze, drifting fog, diamond-grill
   mural, hooded figures, eye glints, gold chain, spell tags.
   ============================================================ */

export function LaneBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={`lane-bg ${className}`} aria-hidden="true">
      <div className="lane-haze-purple" />
      <div className="lane-haze-green" />
      <div className="lane-mural" />
      <div className="lane-fog lane-fog-a" />
      <div className="lane-fog lane-fog-b" />
      {/* hooded watchers at the edges */}
      <div className="lane-hoods">
        <HoodedFigure eyeDelay={0.8} />
        <HoodedFigure flip eyeDelay={2.4} />
      </div>
      <EyeGlints />
      {/* spell tags scrawled in the dark */}
      <div className="lane-spell-tags">
        <SpellbookTag text="shadow money" rotate={-6} size="0.95rem" color="#a3e635" />
        <SpellbookTag text="the lane watches" rotate={4} size="0.9rem" color="#7b2ff7" />
      </div>
      <div className="lane-chain">
        <GoldChain />
      </div>
      <div className="lane-vignette" />
    </div>
  );
}
