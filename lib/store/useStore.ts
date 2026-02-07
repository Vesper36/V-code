import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APIKey, UserStats } from '@/lib/types';

interface AppState {
  keys: APIKey[];
  addKey: (key: APIKey) => void;
  removeKey: (id: string) => void;
  updateKey: (id: string, updates: Partial<APIKey>) => void;
  
  // Basic caching for stats to avoid refetching immediately
  statsCache: Record<string, { data: UserStats; timestamp: number }>;
  setStatsCache: (keyId: string, data: UserStats) => void;
  getStatsFromCache: (keyId: string) => UserStats | null;

  settings: {
    theme: 'light' | 'dark' | 'system';
    showBalance: boolean;
  };
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      keys: [],
      addKey: (key) => set((state) => ({ keys: [...state.keys, key] })),
      removeKey: (id) => set((state) => ({ keys: state.keys.filter((k) => k.id !== id) })),
      updateKey: (id, updates) =>
        set((state) => ({
          keys: state.keys.map((k) => (k.id === id ? { ...k, ...updates } : k)),
        })),

      statsCache: {},
      setStatsCache: (keyId, data) =>
        set((state) => ({
          statsCache: {
            ...state.statsCache,
            [keyId]: { data, timestamp: Date.now() },
          },
        })),
      getStatsFromCache: (keyId) => {
        const cache = get().statsCache[keyId];
        // Cache valid for 5 minutes
        if (cache && Date.now() - cache.timestamp < 5 * 60 * 1000) {
          return cache.data;
        }
        return null;
      },

      settings: {
        theme: 'system',
        showBalance: true,
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'v-ai-storage',
      partialize: (state) => ({ keys: state.keys, settings: state.settings }), // Don't persist cache by default or do? Maybe yes for offline?
      // Let's persist keys and settings. Cache can be transient or persisted if needed.
    }
  )
);
