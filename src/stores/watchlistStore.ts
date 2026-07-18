import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Watchlist {
  id: string;
  name: string;
  assets: string[];
}

export interface WatchlistState {
  activeListId: string;
  lists: Watchlist[];
}

interface WatchlistActions {
  addAsset: (symbol: string, listId?: string) => void;
  removeAsset: (symbol: string, listId?: string) => void;
  reorderAsset: (symbol: string, direction: "up" | "down", listId?: string) => void;
  updateAssetOrder: (watchlistId: string, assets: string[]) => void;
  createWatchlist: (name: string) => void;
  deleteWatchlist: (listId: string) => void;
  renameWatchlist: (listId: string, name: string) => void;
  setActiveWatchlist: (listId: string) => void;
  /** Clears assets on the active list and removes persisted storage when empty. */
  clearActiveWatchlist: () => void;
  importWatchlists: (payload: string) => boolean;
  isInWatchlist: (symbol: string, listId?: string) => boolean;
  getActiveWatchlist: () => Watchlist | undefined;
  exportWatchlists: () => string;
}

export type WatchlistStore = WatchlistState & WatchlistActions;

export const WATCHLIST_STORAGE_KEY = "swipely:watchlist";
/** Legacy key used by the previous React-context implementation. */
export const LEGACY_WATCHLIST_STORAGE_KEY = "swipely.watchlists.v1";

const defaultState: WatchlistState = {
  activeListId: "default",
  lists: [{ id: "default", name: "Default", assets: [] }],
};

function cloneDefaultState(): WatchlistState {
  return {
    activeListId: defaultState.activeListId,
    lists: defaultState.lists.map((list) => ({ ...list, assets: [...list.assets] })),
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isWatchlist(value: unknown): value is Watchlist {
  if (!value || typeof value !== "object") return false;
  const list = value as Record<string, unknown>;
  return (
    typeof list.id === "string" &&
    list.id.length > 0 &&
    typeof list.name === "string" &&
    Array.isArray(list.assets) &&
    list.assets.every((asset) => typeof asset === "string")
  );
}

/**
 * Validate and normalize unknown persisted shapes.
 * Returns null when data is corrupt/unusable so callers can fall back to defaults.
 */
export function normalizeWatchlistState(raw: unknown): WatchlistState | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Record<string, unknown>;
  const listsRaw = candidate.lists;
  if (!Array.isArray(listsRaw) || listsRaw.length === 0) return null;

  const lists: Watchlist[] = [];
  for (const entry of listsRaw) {
    if (!isWatchlist(entry)) continue;
    lists.push({
      id: entry.id,
      name: entry.name,
      assets: entry.assets
        .map((a) => a.trim().toUpperCase())
        .filter((a) => a.length > 0)
        .filter((a, i, arr) => arr.indexOf(a) === i),
    });
  }

  if (lists.length === 0) return null;

  const activeListId =
    typeof candidate.activeListId === "string" &&
    lists.some((list) => list.id === candidate.activeListId)
      ? candidate.activeListId
      : lists[0].id;

  return { activeListId, lists };
}

function readLegacyWatchlistState(): WatchlistState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_WATCHLIST_STORAGE_KEY);
    if (!raw) return null;
    return normalizeWatchlistState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function removeLegacyKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_WATCHLIST_STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}

function allAssetsEmpty(lists: Watchlist[]): boolean {
  return lists.every((list) => list.assets.length === 0);
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      ...cloneDefaultState(),

      addAsset: (symbol, listId) => {
        const normalized = symbol.trim().toUpperCase();
        if (!normalized) return;

        set((state) => {
          const targetId = listId ?? state.activeListId;
          return {
            lists: state.lists.map((list) => {
              if (list.id !== targetId || list.assets.includes(normalized)) {
                return list;
              }
              return { ...list, assets: [...list.assets, normalized] };
            }),
          };
        });
      },

      removeAsset: (symbol, listId) => {
        const normalized = symbol.trim().toUpperCase();
        set((state) => {
          const targetId = listId ?? state.activeListId;
          return {
            lists: state.lists.map((list) =>
              list.id === targetId
                ? { ...list, assets: list.assets.filter((a) => a !== normalized) }
                : list
            ),
          };
        });
      },

      reorderAsset: (symbol, direction, listId) => {
        const normalized = symbol.trim().toUpperCase();
        set((state) => {
          const targetId = listId ?? state.activeListId;
          return {
            lists: state.lists.map((list) => {
              if (list.id !== targetId) return list;
              const index = list.assets.indexOf(normalized);
              if (index === -1) return list;
              const nextIndex = direction === "up" ? index - 1 : index + 1;
              if (nextIndex < 0 || nextIndex >= list.assets.length) return list;
              const assets = [...list.assets];
              [assets[index], assets[nextIndex]] = [assets[nextIndex], assets[index]];
              return { ...list, assets };
            }),
          };
        });
      },

      updateAssetOrder: (watchlistId, assets) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === watchlistId ? { ...list, assets } : list
          ),
        }));
      },

      createWatchlist: (name) => {
        const normalizedName = name.trim();
        if (!normalizedName) return;

        set((state) => {
          const base = slugify(normalizedName) || `watchlist-${state.lists.length + 1}`;
          let id = base;
          let suffix = 1;
          while (state.lists.some((list) => list.id === id)) {
            id = `${base}-${suffix}`;
            suffix += 1;
          }
          return {
            activeListId: id,
            lists: [...state.lists, { id, name: normalizedName, assets: [] }],
          };
        });
      },

      deleteWatchlist: (listId) => {
        set((state) => {
          if (state.lists.length <= 1) return state;
          const lists = state.lists.filter((list) => list.id !== listId);
          if (!lists.length) return state;
          return {
            activeListId:
              state.activeListId === listId ? lists[0].id : state.activeListId,
            lists,
          };
        });
      },

      renameWatchlist: (listId, name) => {
        const normalizedName = name.trim();
        if (!normalizedName) return;
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId ? { ...list, name: normalizedName } : list
          ),
        }));
      },

      setActiveWatchlist: (listId) => {
        set((state) => {
          if (!state.lists.some((list) => list.id === listId)) return state;
          return { activeListId: listId };
        });
      },

      clearActiveWatchlist: () => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.activeListId ? { ...list, assets: [] } : list
          ),
        }));

        // Drop storage keys when every list is empty so cleared data does not linger.
        const { lists } = get();
        if (allAssetsEmpty(lists) && typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(WATCHLIST_STORAGE_KEY);
            window.localStorage.removeItem(LEGACY_WATCHLIST_STORAGE_KEY);
          } catch {
            // ignore storage failures
          }
        }
      },

      importWatchlists: (payload) => {
        try {
          const parsed = JSON.parse(payload) as unknown;
          const normalized = normalizeWatchlistState(parsed);
          if (!normalized) return false;
          set(normalized);
          return true;
        } catch {
          return false;
        }
      },

      isInWatchlist: (symbol, listId) => {
        const normalized = symbol.trim().toUpperCase();
        const state = get();
        const targetId = listId ?? state.activeListId;
        const list = state.lists.find((entry) => entry.id === targetId);
        return list?.assets.includes(normalized) ?? false;
      },

      getActiveWatchlist: () => {
        const state = get();
        return (
          state.lists.find((list) => list.id === state.activeListId) ?? state.lists[0]
        );
      },

      exportWatchlists: () => {
        const { activeListId, lists } = get();
        return JSON.stringify({ activeListId, lists }, null, 2);
      },
    }),
    {
      name: WATCHLIST_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        activeListId: state.activeListId,
        lists: state.lists,
      }),
      migrate: (persisted: unknown) => {
        const normalized = normalizeWatchlistState(persisted);
        return normalized ?? cloneDefaultState();
      },
      merge: (persisted, current) => {
        // Zustand persist may pass the full storage blob or just the state slice.
        const candidate =
          persisted &&
          typeof persisted === "object" &&
          "state" in (persisted as object)
            ? (persisted as { state: unknown }).state
            : persisted;

        const normalized = normalizeWatchlistState(candidate);
        if (normalized) {
          return { ...current, ...normalized };
        }

        // Fall back to legacy key when namespaced key is missing/corrupt.
        const legacy = readLegacyWatchlistState();
        if (legacy) {
          removeLegacyKey();
          return { ...current, ...legacy };
        }

        return current;
      },
      onRehydrateStorage: () => (state) => {
        // If namespaced storage was empty, try migrating the legacy key once.
        if (!state) return;
        if (
          state.lists.length === 1 &&
          state.lists[0].id === "default" &&
          state.lists[0].assets.length === 0
        ) {
          const legacy = readLegacyWatchlistState();
          if (legacy) {
            useWatchlistStore.setState(legacy);
            removeLegacyKey();
          }
        }
      },
    }
  )
);

export const selectWatchlists = (state: WatchlistStore) => state.lists;
export const selectActiveListId = (state: WatchlistStore) => state.activeListId;
export const selectActiveWatchlist = (state: WatchlistStore) =>
  state.lists.find((list) => list.id === state.activeListId) ?? state.lists[0];
export const selectActiveSymbols = (state: WatchlistStore) =>
  selectActiveWatchlist(state)?.assets ?? [];
