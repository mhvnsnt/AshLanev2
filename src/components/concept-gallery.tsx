/**
 * Concept-art gallery — browsable grid of the AshLane concept art.
 *
 * Lives in the library menu. Every image is clearly labeled CONCEPT ART
 * (not in-game assets). Manifest: public/concept-art/manifest.json.
 */
import { useEffect, useState } from "react";
import { assetUrl } from "@/game3d/asset-base";

interface GalleryManifest {
  [dir: string]: string[];
}

const DIR_LABELS: Record<string, string> = {
  districts: "District key art",
  "faction-promos": "Faction promos",
  "faction-wars": "Faction wars",
  "faction-rosters": "Faction rosters",
  menu: "Menu concepts",
  loading: "Loading concepts",
  "shadow-wizard-gang": "Shadow Wizard concepts",
  "swmg-cards": "SWMG cards",
  "kiko-cards": "Kiko cards",
  "onyx-cards": "Onyx cards",
  "new-characters": "New characters",
  reference: "Reference",
  emblems: "Emblem concepts",
};

export function ConceptGallery() {
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [dir, setDir] = useState<string>("districts");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch(assetUrl("concept-art/manifest.json"))
      .then((r) => r.json())
      .then((m: GalleryManifest) => {
        setManifest(m);
        const first = Object.keys(m).find((k) => m[k].length > 0);
        if (first) setDir(first);
      })
      .catch(() => setManifest({}));
  }, []);

  if (manifest === null) {
    return <p className="text-sm text-cream-dim">Loading gallery…</p>;
  }
  const dirs = Object.keys(manifest).filter((k) => manifest[k].length > 0);
  if (dirs.length === 0) {
    return <p className="text-sm text-cream-dim">No concept art found.</p>;
  }
  const files = manifest[dir] ?? [];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-cream-dim">
        <span className="al-gallery-tag" style={{ position: "static" }}>Concept art</span>{" "}
        — explorations and key art, not final in-game assets.
      </p>
      <label className="al-slider-label">
        Collection
        <select
          className="al-select"
          value={dir}
          onChange={(e) => setDir(e.target.value)}
        >
          {dirs.map((d) => (
            <option key={d} value={d}>
              {DIR_LABELS[d] ?? d} ({manifest[d].length})
            </option>
          ))}
        </select>
      </label>
      <div className="al-gallery-grid">
        {files.map((f) => {
          const src = assetUrl(`concept-art/${dir}/${f}`);
          return (
            <button
              key={f}
              type="button"
              className="al-gallery-item"
              onClick={() => setLightbox(src)}
            >
              <span className="al-gallery-tag">Concept</span>
              <img src={src} alt={f.replace(/\.webp$/, "").replace(/[-_]/g, " ")} loading="lazy" />
              <span className="al-gallery-cap">
                {f.replace(/\.webp$/, "").replace(/[-_]/g, " ").slice(0, 32)}
              </span>
            </button>
          );
        })}
      </div>
      {lightbox ? (
        <div
          className="al-lightbox"
          role="button"
          aria-label="Close"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Concept art full view" />
        </div>
      ) : null}
    </div>
  );
}
