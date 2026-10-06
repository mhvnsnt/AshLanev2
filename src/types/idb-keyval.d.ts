// Ambient types for the OPTIONAL idb-keyval dependency.
// saves.ts dynamically imports it and falls back to localStorage when absent.
// Install with `npm i idb-keyval` (Apache-2.0) for the IndexedDB backend.
declare module "idb-keyval" {
  export function get<T = unknown>(key: string): Promise<T | undefined>;
  export function set(key: string, value: unknown): Promise<void>;
}
