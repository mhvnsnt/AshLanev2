/**
 * saves.ts — versioned game saves for AshLane.
 *
 * Storage backend: idb-keyval (Apache-2.0, https://github.com/jakearchibald/idb-keyval)
 * when installed (`npm i idb-keyval`); falls back to localStorage when it's not.
 * IndexedDB is preferred: async (no main-thread jank), bigger quota.
 *
 * Schema discipline:
 *   - Every save is a VersionedSaveEnvelope { schemaVersion, updatedAt, data }.
 *   - Migrations are forward-only N → N+1 steps. Never skip, never branch.
 *   - migrate() runs on a structuredClone — the stored blob is never
 *     overwritten until the migrated save writes cleanly.
 *   - If the save is from a NEWER game version, loadGame() returns null and
 *     the UI should show "save from a newer version" (not corrupt it).
 *
 * What's saved (GameSave): unlocked fighters/stages, settings, campaign
 * progress, records. Fighter state during a fight is NOT saved (session-only).
 */

const CURRENT_SCHEMA_VERSION = 2;
const SAVE_KEY = "ashlane:save:slot1";
const BACKUP_KEY = "ashlane:save:slot1:backup";

export interface GameSettings {
  volume: number; // 0..1
  musicVolume: number; // 0..1
  locale: string; // 'en' | 'es' | ...
  reducedMotion: boolean;
  touchControls: "auto" | "on" | "off";
}

export interface GameSaveV2 {
  playerName: string;
  unlockedFighters: string[];
  unlockedStages: string[];
  settings: GameSettings;
  campaign: { chapter: number; completed: string[] };
  records: { wins: number; losses: number; kos: number };
}

interface SaveEnvelope {
  schemaVersion: number;
  updatedAt: number;
  data: unknown;
}

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/** Forward-only migrations. Add a new entry (never edit old ones) when the schema changes. */
const MIGRATIONS: Record<number, Migration> = {
  1: (v1) => ({
    ...v1,
    campaign: { chapter: 0, completed: [] },
    records: { wins: 0, losses: 0, kos: 0 },
  }),
};

export const DEFAULT_SAVE: GameSaveV2 = {
  playerName: "Player",
  unlockedFighters: ["stick-up"],
  unlockedStages: ["scrap-street"],
  settings: {
    volume: 0.8,
    musicVolume: 0.7,
    locale: "en",
    reducedMotion: false,
    touchControls: "auto",
  },
  campaign: { chapter: 0, completed: [] },
  records: { wins: 0, losses: 0, kos: 0 },
};

// ---------------------------------------------------------------------------
// Storage backend: idb-keyval when available, localStorage otherwise
// ---------------------------------------------------------------------------

type KV = {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
};

let kvPromise: Promise<KV> | null = null;

// Optional dependency — install with `npm i idb-keyval` for the faster
// IndexedDB backend. The dynamic import below is typed via
// src/types/idb-keyval.d.ts so the module typechecks either way.

function backend(): Promise<KV> {
  if (!kvPromise) {
    kvPromise = import("idb-keyval")
      .then((m) => ({ get: m.get, set: m.set }) as KV)
      .catch(() => ({
        // localStorage fallback — synchronous API wrapped async.
        get: async (key: string) => {
          const raw = localStorage.getItem(key);
          return raw ? (JSON.parse(raw) as unknown) : undefined;
        },
        set: async (key: string, value: unknown) => {
          localStorage.setItem(key, JSON.stringify(value));
        },
      }));
  }
  return kvPromise;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function migrate(envelope: SaveEnvelope): SaveEnvelope {
  if (envelope.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Save is from a newer game version (v${envelope.schemaVersion} > v${CURRENT_SCHEMA_VERSION})`,
    );
  }
  let { schemaVersion, data } = envelope;
  let d = data as Record<string, unknown>;
  while (schemaVersion < CURRENT_SCHEMA_VERSION) {
    const step = MIGRATIONS[schemaVersion];
    if (!step) throw new Error(`No migration path from save v${schemaVersion}`);
    d = step(d);
    schemaVersion++;
  }
  return { ...envelope, schemaVersion, data: d };
}

export async function saveGame(data: GameSaveV2): Promise<void> {
  const kv = await backend();
  const envelope: SaveEnvelope = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: Date.now(),
    data,
  };
  // Keep the previous good save as a backup before overwriting.
  const prev = await kv.get(SAVE_KEY);
  if (prev) await kv.set(BACKUP_KEY, prev);
  await kv.set(SAVE_KEY, envelope);
}

export type LoadResult =
  | { ok: true; save: GameSaveV2; migrated: boolean }
  | { ok: false; reason: "empty" | "corrupt" | "newer-version" };

export async function loadGame(): Promise<LoadResult> {
  const kv = await backend();
  const raw = (await kv.get(SAVE_KEY)) as SaveEnvelope | undefined;
  if (!raw || typeof raw.schemaVersion !== "number") {
    return { ok: false, reason: "empty" };
  }
  try {
    // Migrate on a COPY — never touch the stored blob until we can write clean.
    const migrated = migrate(structuredClone(raw));
    if (migrated.schemaVersion !== raw.schemaVersion) {
      await kv.set(SAVE_KEY, migrated);
    }
    return {
      ok: true,
      save: migrated.data as GameSaveV2,
      migrated: migrated.schemaVersion !== raw.schemaVersion,
    };
  } catch (e) {
    if (String(e).includes("newer game version")) {
      return { ok: false, reason: "newer-version" };
    }
    console.error("Save corrupted:", e);
    return { ok: false, reason: "corrupt" };
  }
}

/** Export save as a downloadable JSON file (offline backup / transfer). */
export function exportSaveFile(save: GameSaveV2): void {
  const blob = new Blob([JSON.stringify({ exportedAt: Date.now(), save }, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ashlane-save-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------------------------------------------------------------------------
// Compressed save export/import — fflate (MIT, https://github.com/101arrowz/fflate)
// Round 7 wiring. Optional dependency (same pattern as idb-keyval above):
// gzip when installed (`npm i fflate`), raw JSON bytes when it's not.
// ---------------------------------------------------------------------------

export interface SaveExportPayload {
  exportedAt: number;
  save: GameSaveV2;
}

const GZIP_MAGIC_0 = 0x1f;
const GZIP_MAGIC_1 = 0x8b;

type Fflate = typeof import("fflate");

let fflatePromise: Promise<Fflate | null> | null = null;

function fflateOrNull(): Promise<Fflate | null> {
  if (!fflatePromise) {
    fflatePromise = import("fflate").catch(() => null);
  }
  return fflatePromise;
}

/**
 * Serialize a save to bytes for export/transfer. Gzip-compressed when fflate
 * is installed (~70% smaller than JSON), plain UTF-8 JSON bytes otherwise.
 * The gzip magic header lets importSaveCompressed auto-detect either form.
 */
export async function exportSaveCompressed(save: GameSaveV2): Promise<Uint8Array> {
  const payload: SaveExportPayload = { exportedAt: Date.now(), save };
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const ff = await fflateOrNull();
  return ff ? ff.gzipSync(json, { level: 6 }) : json;
}

/**
 * Parse bytes produced by exportSaveCompressed. Auto-detects gzip vs raw
 * JSON via the magic header. Throws on corrupt/unparseable data.
 */
export async function importSaveCompressed(bytes: Uint8Array): Promise<SaveExportPayload> {
  let raw = bytes;
  if (bytes.length >= 2 && bytes[0] === GZIP_MAGIC_0 && bytes[1] === GZIP_MAGIC_1) {
    const ff = await fflateOrNull();
    if (!ff) {
      throw new Error(
        "Save is gzip-compressed but fflate is not installed — run `npm i fflate`",
      );
    }
    try {
      raw = ff.gunzipSync(bytes);
    } catch {
      throw new Error("Save data is corrupt (gzip decompression failed)");
    }
  }
  try {
    const payload = JSON.parse(new TextDecoder().decode(raw)) as SaveExportPayload;
    if (!payload || typeof payload.exportedAt !== "number" || !payload.save) {
      throw new Error("missing fields");
    }
    return payload;
  } catch {
    throw new Error("Save data is corrupt (not valid save JSON)");
  }
}

/** Download the save as a .json.gz file (browser). Falls back to .json. */
export async function exportSaveFileCompressed(save: GameSaveV2): Promise<void> {
  const bytes = await exportSaveCompressed(save);
  const gzipped = bytes.length >= 2 && bytes[0] === GZIP_MAGIC_0 && bytes[1] === GZIP_MAGIC_1;
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: gzipped ? "application/gzip" : "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ashlane-save-${new Date().toISOString().slice(0, 10)}.${gzipped ? "json.gz" : "json"}`;
  a.click();
  URL.revokeObjectURL(a.href);
}
