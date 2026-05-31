import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

/**
 * Connection store
 * ---------------------------------------------------------------------------
 * Holds the backend connection settings AT RUNTIME so the user can change them
 * from the Settings screen instead of editing source code. Persisted with
 * expo-secure-store. Supports two modes:
 *   - local  : http://<LAN ip>:<port>   (phone + PC on same WiFi)
 *   - tunnel : https://<cloudflare url>  (works from anywhere)
 * Because only one PC runs the backend at a time, every screen falls back to
 * cached/seed data when the backend is unreachable.
 * ---------------------------------------------------------------------------
 */

const STORAGE_KEY = 'wm_connection_v1';

export type ConnMode = 'local' | 'tunnel';
export type ConnStatus = 'unknown' | 'checking' | 'online' | 'offline';

interface PersistedConfig {
  mode: ConnMode;
  localIP: string;
  localPort: string;
  tunnelURL: string;
}

interface ConnectionState extends PersistedConfig {
  status: ConnStatus;
  lastCheck: string | null;
  serverHostname: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  update: (partial: Partial<PersistedConfig>) => Promise<void>;
  getRootURL: () => string;
  getApiURL: () => string;
  checkHealth: () => Promise<boolean>;
  setStatus: (status: ConnStatus) => void;
}

const DEFAULTS: PersistedConfig = {
  mode: 'local',
  localIP: '192.168.1.100',
  localPort: '3001',
  tunnelURL: '',
};

function buildRoot(cfg: PersistedConfig): string {
  if (cfg.mode === 'tunnel' && cfg.tunnelURL) {
    return cfg.tunnelURL.replace(/\/$/, '');
  }
  return `http://${cfg.localIP}:${cfg.localPort}`;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  ...DEFAULTS,
  status: 'unknown',
  lastCheck: null,
  serverHostname: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedConfig>;
        set({ ...DEFAULTS, ...parsed, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  update: async (partial) => {
    set(partial);
    const { mode, localIP, localPort, tunnelURL } = get();
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ mode, localIP, localPort, tunnelURL }));
    } catch {
      // ignore persistence errors
    }
  },

  getRootURL: () => buildRoot(get()),
  getApiURL: () => `${buildRoot(get())}/api`,

  setStatus: (status) => set({ status }),

  checkHealth: async () => {
    const root = buildRoot(get());
    set({ status: 'checking' });
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${root}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        set({
          status: 'online',
          lastCheck: new Date().toISOString(),
          serverHostname: data?.hostname ?? null,
        });
        return true;
      }
      set({ status: 'offline', lastCheck: new Date().toISOString() });
      return false;
    } catch {
      set({ status: 'offline', lastCheck: new Date().toISOString() });
      return false;
    }
  },
}));
