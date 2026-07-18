import { describe, it, expect, beforeEach } from "vitest";
import {
  useWatchlistStore,
  normalizeWatchlistState,
  WATCHLIST_STORAGE_KEY,
  LEGACY_WATCHLIST_STORAGE_KEY,
} from "./watchlistStore";

function resetStore() {
  useWatchlistStore.setState(useWatchlistStore.getInitialState(), true);
}

describe("watchlistStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("initializes with a default empty watchlist", () => {
    const state = useWatchlistStore.getState();
    expect(state.lists).toHaveLength(1);
    expect(state.lists[0].id).toBe("default");
    expect(state.activeListId).toBe("default");
    expect(state.lists[0].assets).toEqual([]);
  });

  it("adds and removes assets and persists them", () => {
    const store = useWatchlistStore.getState();
    store.addAsset("usdc");
    store.addAsset("EURC");

    expect(useWatchlistStore.getState().lists[0].assets).toEqual(["USDC", "EURC"]);

    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).toContain("USDC");
    expect(raw).toContain("EURC");

    useWatchlistStore.getState().removeAsset("USDC");
    expect(useWatchlistStore.getState().lists[0].assets).toEqual(["EURC"]);
  });

  it("ignores empty and duplicate assets", () => {
    const store = useWatchlistStore.getState();
    store.addAsset("USDC");
    store.addAsset("USDC");
    store.addAsset("  ");
    expect(useWatchlistStore.getState().lists[0].assets).toEqual(["USDC"]);
  });

  it("rehydrates persisted watchlist across restarts", async () => {
    useWatchlistStore.getState().addAsset("BTC");

    // Capture what was persisted before simulating a restart.
    const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);

    // Simulate a fresh store instance: reset in-memory state, then restore
    // the persisted data so rehydrate() can read it back (resetStore triggers
    // the persist middleware which would otherwise overwrite localStorage).
    resetStore();
    if (saved) localStorage.setItem(WATCHLIST_STORAGE_KEY, saved);

    expect(useWatchlistStore.getState().lists[0].assets).toEqual([]);

    await useWatchlistStore.persist.rehydrate();
    expect(useWatchlistStore.getState().lists[0].assets).toContain("BTC");
  });

  it("migrates legacy localStorage key on merge/rehydrate", async () => {
    localStorage.setItem(
      LEGACY_WATCHLIST_STORAGE_KEY,
      JSON.stringify({
        activeListId: "default",
        lists: [{ id: "default", name: "Default", assets: ["XLM"] }],
      })
    );

    await useWatchlistStore.persist.rehydrate();
    expect(useWatchlistStore.getState().lists[0].assets).toContain("XLM");
  });

  it("handles corrupt persisted data without crashing", async () => {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, "not-json{{{");
    await expect(useWatchlistStore.persist.rehydrate()).resolves.not.toThrow();

    localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      JSON.stringify({ state: { lists: "nope", activeListId: 123 }, version: 1 })
    );
    await expect(useWatchlistStore.persist.rehydrate()).resolves.not.toThrow();
    expect(useWatchlistStore.getState().lists[0].id).toBe("default");
  });

  it("clearActiveWatchlist empties assets and clears persisted symbols", () => {
    useWatchlistStore.getState().addAsset("USDC");
    expect(localStorage.getItem(WATCHLIST_STORAGE_KEY)).toContain("USDC");

    useWatchlistStore.getState().clearActiveWatchlist();
    expect(useWatchlistStore.getState().lists[0].assets).toEqual([]);

    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    // Either removed entirely or rewritten without prior symbols.
    if (raw) {
      expect(raw).not.toContain("USDC");
    }
  });

  it("normalizeWatchlistState rejects invalid shapes", () => {
    expect(normalizeWatchlistState(null)).toBeNull();
    expect(normalizeWatchlistState({ lists: [] })).toBeNull();
    expect(normalizeWatchlistState({ lists: [{ id: 1 }] })).toBeNull();
    expect(
      normalizeWatchlistState({
        activeListId: "a",
        lists: [{ id: "a", name: "A", assets: ["xlm"] }],
      })
    ).toEqual({
      activeListId: "a",
      lists: [{ id: "a", name: "A", assets: ["XLM"] }],
    });
  });
});
