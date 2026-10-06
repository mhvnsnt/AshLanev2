/**
 * nakama-client.ts — optional Nakama backend wrapper for AshLane.
 *
 * Nakama (Apache-2.0, heroiclabs.com) provides device-ID auth, a virtual
 * wallet (implemented here as a private storage object), and leaderboards.
 * Everything in this module fails SOFT: if the server is unreachable every
 * call resolves with the offline fallback and the game keeps working.
 *
 * Wire-up: services.ts owns one NakamaBackend per game session
 * (`GameServices.backend`). mount.ts should call `connect()` once at boot;
 * everything else is explicit (award currency on mission complete, submit
 * score on arcade run end).
 *
 * Server: tools/nakama/docker-compose.yml (`docker compose up`).
 */

import { Client, type Session } from "@heroiclabs/nakama-js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface NakamaConfig {
  host: string;
  port: string;
  /** Nakama API "server key" — must match socket.server_key in data.yml. */
  serverKey: string;
  useSSL: boolean;
}

export const DEFAULT_NAKAMA_CONFIG: NakamaConfig = {
  host: import.meta.env?.VITE_NAKAMA_HOST ?? "127.0.0.1",
  port: import.meta.env?.VITE_NAKAMA_PORT ?? "7350",
  serverKey: import.meta.env?.VITE_NAKAMA_KEY ?? "defaultkey",
  useSSL: (import.meta.env?.VITE_NAKAMA_SSL ?? "0") === "1",
};

/** The arcade leaderboard id shared by all players. Auto-created by Nakama
 *  on the first submitted score (descending sort, best score wins). */
export const ARCADE_LEADERBOARD_ID = "arcade_high_scores";

/** Storage object holding the player's street cash. */
const WALLET_COLLECTION = "wallet";
const WALLET_KEY = "ashlane";

const DEVICE_ID_KEY = "ashlane_device_id";
const LOCAL_WALLET_KEY = "ashlane_wallet_cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Backend connection state for HUD/debug display. */
export type NakamaStatus = "disconnected" | "connecting" | "online" | "offline";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  own: boolean;
}

// ---------------------------------------------------------------------------
// Browser-local helpers (device id + offline wallet cache)
// ---------------------------------------------------------------------------

function storageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

function getDeviceId(): string {
  if (storageAvailable()) {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = randomId();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  }
  // SSR / non-browser: fresh id per process (no persistence).
  return randomId();
}

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `dev-${Math.floor(Math.random() * 0xffffffff).toString(16)}-${Date.now().toString(16)}`;
}

function readLocalWallet(): number {
  if (!storageAvailable()) return 0;
  const raw = window.localStorage.getItem(LOCAL_WALLET_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function writeLocalWallet(paper: number): void {
  if (storageAvailable()) window.localStorage.setItem(LOCAL_WALLET_KEY, String(Math.max(0, Math.floor(paper))));
}

// ---------------------------------------------------------------------------
// NakamaBackend
// ---------------------------------------------------------------------------

export class NakamaBackend {
  readonly config: NakamaConfig;
  status: NakamaStatus = "disconnected";
  /** Stable per-install player id (localStorage-backed). */
  readonly deviceId: string;
  private client: Client | null = null;
  private session: Session | null = null;
  private connecting: Promise<NakamaStatus> | null = null;

  constructor(config: NakamaConfig = DEFAULT_NAKAMA_CONFIG) {
    this.config = config;
    this.deviceId = getDeviceId();
  }

  /** True after a successful authenticateDevice. */
  get online(): boolean {
    return this.status === "online" && this.session !== null;
  }

  // -- connect -------------------------------------------------------------

  /**
   * Authenticate with the server via device ID (creates the account on first
   * run). Never throws: on failure status becomes "offline" and the game
   * continues without the backend.
   */
  connect(): Promise<NakamaStatus> {
    if (this.online) return Promise.resolve(this.status);
    if (this.connecting) return this.connecting;
    this.connecting = (async (): Promise<NakamaStatus> => {
      this.status = "connecting";
      try {
        const client = new Client(
          this.config.serverKey,
          this.config.host,
          this.config.port,
          this.config.useSSL,
          8000, // 8s timeout so a dead server fails fast
        );
        const session = await client.authenticateDevice(this.deviceId, true);
        this.client = client;
        this.session = session;
        this.status = "online";
      } catch {
        this.client = null;
        this.session = null;
        this.status = "offline";
      } finally {
        this.connecting = null;
      }
      return this.status;
    })();
    return this.connecting;
  }

  /** Drop the session; the next call re-authenticates. */
  disconnect(): void {
    this.client = null;
    this.session = null;
    this.status = "disconnected";
  }

  // -- wallet ---------------------------------------------------------------

  /**
   * Player street-cash balance. Offline: returns the local cached balance
   * (never throws).
   */
  async getWallet(): Promise<number> {
    if (!this.online) {
      // Best effort: if we were never connected, try once in the background.
      if (this.status === "disconnected") void this.connect();
      return readLocalWallet();
    }
    try {
      const result = await this.client!.readStorageObjects(this.session!, {
        object_ids: [{ collection: WALLET_COLLECTION, key: WALLET_KEY }],
      });
      const paper = (result.objects?.[0]?.value as { paper?: number } | undefined)?.paper;
      const balance = Number.isFinite(paper) ? Math.max(0, Math.floor(paper!)) : 0;
      writeLocalWallet(balance);
      return balance;
    } catch {
      this.markOffline();
      return readLocalWallet();
    }
  }

  /**
   * Add (or remove, with negative delta) street cash. Always applies to the
   * local cache so the game economy works offline; syncs to the server when
   * online. Returns the new balance. Never throws.
   */
  async updateWallet(delta: number): Promise<number> {
    const current = await this.getWallet();
    const next = Math.max(0, Math.floor(current + delta));
    writeLocalWallet(next);
    if (this.online) {
      try {
        await this.client!.writeStorageObjects(this.session!, [
          {
            collection: WALLET_COLLECTION,
            key: WALLET_KEY,
            value: { paper: next },
            permission_read: 1, // owner only
            permission_write: 1, // owner only
          },
        ]);
      } catch {
        this.markOffline();
      }
    }
    return next;
  }

  // -- leaderboard -----------------------------------------------------------

  /**
   * Top arcade scores (descending). Offline: []. Never throws.
   */
  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    if (!this.online) return [];
    try {
      const list = await this.client!.listLeaderboardRecords(
        this.session!,
        ARCADE_LEADERBOARD_ID,
        undefined,
        Math.max(1, Math.min(100, limit)),
      );
      const mine = this.session!.user_id;
      return (list.records ?? []).map((r) => ({
        rank: r.rank ?? 0,
        username: r.username ?? "player",
        score: r.score ?? 0,
        own: r.owner_id === mine,
      }));
    } catch {
      this.markOffline();
      return [];
    }
  }

  /**
   * Submit an arcade high score. No-op offline. Returns true if the server
   * accepted the record. Never throws.
   */
  async submitScore(score: number): Promise<boolean> {
    if (!this.online || !Number.isFinite(score) || score <= 0) return false;
    try {
      await this.client!.writeLeaderboardRecord(this.session!, ARCADE_LEADERBOARD_ID, {
        score: String(Math.floor(score)),
      });
      return true;
    } catch {
      this.markOffline();
      return false;
    }
  }

  // -- internals --------------------------------------------------------------

  private markOffline(): void {
    this.session = null;
    this.client = null;
    this.status = "offline";
  }
}

/** Create a backend instance (services.ts owns one per game session). */
export function createNakamaBackend(config: NakamaConfig = DEFAULT_NAKAMA_CONFIG): NakamaBackend {
  return new NakamaBackend(config);
}
