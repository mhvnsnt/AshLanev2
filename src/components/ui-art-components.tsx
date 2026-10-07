/**
 * AshLane UI art components — React wrappers for the sliced menu-kit art.
 *
 * All art paths come from @/game3d/ui-art (the manifest) and are resolved
 * through assetUrl() for the GitHub Pages base. These components wire the
 * art into the HUD, menus, character select, dialogue, VS screen, and
 * settings — no CSS-only placeholders where real art exists.
 */
import { assetUrl } from "@/game3d/asset-base";
import { UI_ART, EMBLEMS, getEmblem, type EmblemEntry } from "@/game3d/ui-art";

function art(key: keyof typeof UI_ART): string {
  return assetUrl(UI_ART[key]);
}

export function emblemUrl(id: string): string {
  const e = getEmblem(id);
  return e ? assetUrl(e.art) : "";
}

/** Faction/personal emblem rendered from the sliced PNG art (not SVG). */
export function EmblemImage({
  id,
  size = 48,
  label,
}: {
  id: string;
  size?: number;
  label?: string;
}) {
  const e: EmblemEntry | undefined = getEmblem(id);
  if (!e) return null;
  return (
    <img
      src={assetUrl(e.art)}
      alt={label ?? e.name}
      title={label ?? e.name}
      width={size}
      height={size}
      loading="lazy"
      className="al-emblem-img"
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Health/super bar built on the sliced bar art.
 * The bar art is the frame; a dynamic fill is overlaid inside the fill region.
 * `variant` picks the art: "hp" -> healthbar-classic, "super" -> super-flame.
 */
export function ArtMeter({
  label,
  value,
  variant = "hp",
}: {
  label: string;
  value: number;
  variant?: "hp" | "super";
}) {
  const v = Math.max(0, Math.min(1, value));
  const src = art(variant === "hp" ? "healthbar-classic" : "super-flame");
  return (
    <div className="al-artmeter">
      <span className="al-artmeter-label">{label}</span>
      <div className="al-artmeter-wrap">
        <img src={src} alt="" aria-hidden="true" className="al-artmeter-frame" />
        <div className="al-artmeter-track">
          <div
            className={`al-artmeter-fill${variant === "super" ? " super" : ""}`}
            style={{ width: `${v * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Combo counter badge — picks the x2/x5/x10/x25/x50 art by combo count. */
export function ComboBadge({ count }: { count: number }) {
  if (count < 2) return null;
  const key =
    count >= 50 ? "combo-x50"
    : count >= 25 ? "combo-x25"
    : count >= 10 ? "combo-x10"
    : count >= 5 ? "combo-x5"
    : "combo-x2";
  return (
    <img
      src={art(key)}
      alt={`${count} hit combo`}
      className="al-combo-badge"
      loading="lazy"
    />
  );
}

/** Round timer medallion with the remaining time overlaid. */
export function TimerMedallion({
  seconds,
  variant = "timer-circular",
}: {
  seconds: number;
  variant?: "timer-circular" | "timer-hex" | "timer-shield";
}) {
  const mm = Math.floor(Math.max(0, seconds) / 60);
  const ss = Math.floor(Math.max(0, seconds) % 60);
  return (
    <div className="al-timer-medallion">
      <img src={art(variant)} alt="" aria-hidden="true" />
      <span className="al-timer-digits">
        {mm}:{String(ss).padStart(2, "0")}
      </span>
    </div>
  );
}

/** Rank badge (S/A/B/C/D) for results screens. */
export function RankBadge({ rank }: { rank: "s" | "a" | "b" | "c" | "d" }) {
  return (
    <img
      src={art(`rank-${rank}` as keyof typeof UI_ART)}
      alt={`Rank ${rank.toUpperCase()}`}
      className="al-rank-badge"
      loading="lazy"
    />
  );
}

/** Map marker pin for the city/ward map. */
export function MapMarker({
  kind,
  size = 40,
}: {
  kind:
    | "arena" | "shop" | "hideout" | "boss"
    | "checkpoint" | "danger" | "ally" | "mystery";
  size?: number;
}) {
  return (
    <img
      src={art(`marker-${kind}` as keyof typeof UI_ART)}
      alt={`${kind} marker`}
      width={size}
      height={size}
      loading="lazy"
      className="al-map-marker"
      style={{ width: size, height: size }}
    />
  );
}

/** Weapon pickup icon. */
export function WeaponIcon({
  weapon,
  size = 44,
}: {
  weapon: "chain" | "bat" | "pipe" | "knife" | "brick" | "tireiron";
  size?: number;
}) {
  return (
    <img
      src={art(`weapon-${weapon}` as keyof typeof UI_ART)}
      alt={`${weapon}`}
      width={size}
      height={size}
      loading="lazy"
      className="al-weapon-icon"
      style={{ width: size, height: size }}
    />
  );
}

/** Pickup icon (cash, health, armor, bandage, energy, star). */
export function PickupIcon({
  pickup,
  size = 44,
}: {
  pickup: "cash" | "health" | "armor" | "bandage" | "energy" | "star";
  size?: number;
}) {
  return (
    <img
      src={art(`pickup-${pickup}` as keyof typeof UI_ART)}
      alt={`${pickup} pickup`}
      width={size}
      height={size}
      loading="lazy"
      className="al-pickup-icon"
      style={{ width: size, height: size }}
    />
  );
}

/** Circular menu button (fight / confirm / back / settings / refresh / close). */
export function CircleButton({
  action,
  label,
  onClick,
  size = 56,
}: {
  action: "fight" | "confirm" | "back" | "settings" | "refresh" | "close";
  label: string;
  onClick: () => void;
  size?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="al-circle-btn"
      style={{ width: size, height: size }}
    >
      <img src={art(`btn-${action}` as keyof typeof UI_ART)} alt="" aria-hidden="true" />
    </button>
  );
}

/** Graffiti menu button with normal/hover/pressed states from the art. */
export function ArtButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`al-art-btn ${className}`}>
      <img src={art("button-normal")} alt="" aria-hidden="true" className="al-art-btn-bg" />
      <span className="al-art-btn-label">{children}</span>
    </button>
  );
}

/** Sticker/deco art for menus. */
export function Sticker({
  kind,
  size = 72,
}: {
  kind: "star" | "splat" | "bolt" | "crown-neon" | "glove-gold";
  size?: number;
}) {
  return (
    <img
      src={art(`sticker-${kind}` as keyof typeof UI_ART)}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      className="al-sticker"
      style={{ width: size, height: size }}
    />
  );
}

/** Chain divider strip for menus. */
export function ChainDivider() {
  return (
    <img
      src={art("divider-chain-gold")}
      alt=""
      aria-hidden="true"
      className="al-chain-divider"
      loading="lazy"
    />
  );
}

/** All canon + generic emblems for the emblem picker grid. */
export function EmblemPickerGrid({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="al-emblem-grid">
      {EMBLEMS.map((e) => (
        <button
          key={e.id}
          type="button"
          data-on={selected === e.id ? "1" : undefined}
          className="al-emblem-btn"
          onClick={() => onSelect(selected === e.id ? null : e.id)}
          title={e.name}
        >
          <EmblemImage id={e.id} size={48} />
          <span className="al-emblem-label">{e.name}</span>
        </button>
      ))}
    </div>
  );
}
