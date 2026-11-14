import type { PersistStorage, StorageValue } from 'zustand/middleware';
import type { AppData } from './types';

/**
 * Key-value backend. Today it is localStorage; a Capacitor build can swap in
 * `@capacitor/preferences` (async) or a sync layer without touching the store.
 */
export interface KVBackend {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

const memory = new Map<string, string>();
export const localBackend: KVBackend = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return memory.get(k) ?? null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      memory.delete(k);
    }
  },
};

/**
 * Zustand persist adapter that stores the state *flat* (no `{state, version}`
 * envelope), in the exact shape of the legacy prototype plus `schemaVersion`.
 */
export function flatStorage(backend: KVBackend = localBackend): PersistStorage<AppData> {
  const parse = (raw: string | null): StorageValue<AppData> | null => {
    if (!raw) return null;
    try {
      const state = JSON.parse(raw);
      if (!state || typeof state !== 'object') return null;
      return { state, version: typeof state.schemaVersion === 'number' ? state.schemaVersion : 0 };
    } catch {
      return null;
    }
  };
  return {
    getItem: (name) => {
      const raw = backend.getItem(name);
      return raw instanceof Promise ? raw.then(parse) : parse(raw);
    },
    setItem: (name, value) => backend.setItem(name, JSON.stringify({ ...value.state, schemaVersion: value.version ?? 0 })),
    removeItem: (name) => backend.removeItem(name),
  };
}
