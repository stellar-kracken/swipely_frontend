import { describe, it, expect, beforeEach } from "vitest";
import {
  useBridgeFilterSortStore,
  normalizeBridgeFilterSortState,
  applyBridgeFilterSort,
  BRIDGE_FILTER_SORT_STORAGE_KEY,
} from "./bridgeFilterSortStore";

function resetStore() {
  useBridgeFilterSortStore.setState(
    useBridgeFilterSortStore.getInitialState(),
    true
  );
}

const sampleBridges = [
  {
    name: "Zebra",
    status: "healthy" as const,
    totalValueLocked: 100,
    mismatchPercentage: 0,
    volume24h: 10,
  },
  {
    name: "Alpha",
    status: "degraded" as const,
    totalValueLocked: 500,
    mismatchPercentage: 0.2,
    volume24h: 50,
  },
  {
    name: "Mid",
    status: "down" as const,
    totalValueLocked: 250,
    mismatchPercentage: 2,
    volume24h: 5,
  },
];

describe("bridgeFilterSortStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("starts with default filter and sort", () => {
    const state = useBridgeFilterSortStore.getState();
    expect(state.statusFilter).toBe("all");
    expect(state.sortBy).toBe("name");
  });

  it("persists status filter and sort selections", () => {
    useBridgeFilterSortStore.getState().setStatusFilter("healthy");
    useBridgeFilterSortStore.getState().setSortBy("tvl");

    const raw = localStorage.getItem(BRIDGE_FILTER_SORT_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).toContain("healthy");
    expect(raw).toContain("tvl");
  });

  it("rehydrates filter/sort on return", async () => {
    useBridgeFilterSortStore.getState().setStatusFilter("degraded");
    useBridgeFilterSortStore.getState().setSortBy("health");

    // Capture persisted data before simulating a restart.
    const saved = localStorage.getItem(BRIDGE_FILTER_SORT_STORAGE_KEY);

    // Reset in-memory state, then restore the saved blob so rehydrate() can
    // read it back (resetStore triggers persist middleware which would
    // otherwise overwrite localStorage with the defaults).
    resetStore();
    if (saved) localStorage.setItem(BRIDGE_FILTER_SORT_STORAGE_KEY, saved);

    expect(useBridgeFilterSortStore.getState().statusFilter).toBe("all");

    await useBridgeFilterSortStore.persist.rehydrate();
    expect(useBridgeFilterSortStore.getState().statusFilter).toBe("degraded");
    expect(useBridgeFilterSortStore.getState().sortBy).toBe("health");
  });

  it("ignores invalid status/sort values", () => {
    useBridgeFilterSortStore.getState().setStatusFilter("not-a-status");
    useBridgeFilterSortStore.getState().setSortBy("not-a-sort");
    expect(useBridgeFilterSortStore.getState().statusFilter).toBe("all");
    expect(useBridgeFilterSortStore.getState().sortBy).toBe("name");
  });

  it("handles corrupt persisted data without crashing", async () => {
    localStorage.setItem(BRIDGE_FILTER_SORT_STORAGE_KEY, "{broken");
    await expect(useBridgeFilterSortStore.persist.rehydrate()).resolves.not.toThrow();

    localStorage.setItem(
      BRIDGE_FILTER_SORT_STORAGE_KEY,
      JSON.stringify({
        state: { statusFilter: "bogus", sortBy: 99 },
        version: 1,
      })
    );
    await useBridgeFilterSortStore.persist.rehydrate();
    expect(useBridgeFilterSortStore.getState().statusFilter).toBe("all");
    expect(useBridgeFilterSortStore.getState().sortBy).toBe("name");
  });

  it("normalizeBridgeFilterSortState falls back on unknown shapes", () => {
    expect(normalizeBridgeFilterSortState(null)).toEqual({
      statusFilter: "all",
      sortBy: "name",
    });
    expect(
      normalizeBridgeFilterSortState({ statusFilter: "down", sortBy: "volume" })
    ).toEqual({ statusFilter: "down", sortBy: "volume" });
  });

  it("applyBridgeFilterSort filters and sorts bridges", () => {
    const healthy = applyBridgeFilterSort(sampleBridges, "healthy", "name");
    expect(healthy.map((b) => b.name)).toEqual(["Zebra"]);

    const byTvl = applyBridgeFilterSort(sampleBridges, "all", "tvl");
    expect(byTvl.map((b) => b.name)).toEqual(["Alpha", "Mid", "Zebra"]);

    const byName = applyBridgeFilterSort(sampleBridges, "all", "name");
    expect(byName.map((b) => b.name)).toEqual(["Alpha", "Mid", "Zebra"]);
  });
});
