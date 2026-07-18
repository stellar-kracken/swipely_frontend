import { Fragment, createElement, type ReactNode } from "react";
import {
  useWatchlistStore,
  selectActiveWatchlist,
  selectActiveSymbols,
  type Watchlist,
} from "../stores/watchlistStore";

export type { Watchlist };

/**
 * Watchlist API backed by the persisted Zustand store under `src/stores/`.
 * WatchlistProvider is retained for call-site compatibility; the store is the
 * single source of truth and rehydrates from namespaced localStorage.
 */
export function useWatchlist() {
  const lists = useWatchlistStore((state) => state.lists);
  const activeListId = useWatchlistStore((state) => state.activeListId);
  const activeWatchlist = useWatchlistStore(selectActiveWatchlist);
  const activeSymbols = useWatchlistStore(selectActiveSymbols);

  const addAsset = useWatchlistStore((state) => state.addAsset);
  const removeAsset = useWatchlistStore((state) => state.removeAsset);
  const reorderAsset = useWatchlistStore((state) => state.reorderAsset);
  const updateAssetOrder = useWatchlistStore((state) => state.updateAssetOrder);
  const createWatchlist = useWatchlistStore((state) => state.createWatchlist);
  const deleteWatchlist = useWatchlistStore((state) => state.deleteWatchlist);
  const renameWatchlist = useWatchlistStore((state) => state.renameWatchlist);
  const setActiveWatchlist = useWatchlistStore((state) => state.setActiveWatchlist);
  const clearActiveWatchlist = useWatchlistStore((state) => state.clearActiveWatchlist);
  const exportWatchlists = useWatchlistStore((state) => state.exportWatchlists);
  const importWatchlists = useWatchlistStore((state) => state.importWatchlists);
  const isInWatchlist = useWatchlistStore((state) => state.isInWatchlist);

  return {
    watchlists: lists,
    activeWatchlist,
    activeListId,
    activeSymbols,
    addAsset,
    removeAsset,
    reorderAsset,
    updateAssetOrder,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    setActiveWatchlist,
    clearActiveWatchlist,
    exportWatchlists,
    importWatchlists,
    isInWatchlist,
  };
}

/** Pass-through provider kept for existing app tree and tests. */
export function WatchlistProvider({ children }: { children: ReactNode }) {
  return createElement(Fragment, null, children);
}
