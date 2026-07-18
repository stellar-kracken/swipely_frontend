import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BridgeStatusFilter = "all" | "healthy" | "degraded" | "down" | "unknown";
export type BridgeSortBy = "name" | "tvl" | "volume" | "health";

export interface BridgeFilterSortState {
  statusFilter: BridgeStatusFilter;
  sortBy: BridgeSortBy;
}

interface BridgeFilterSortActions {
  setStatusFilter: (status: BridgeStatusFilter | string) => void;
  setSortBy: (sortBy: BridgeSortBy | string) => void;
  reset: () => void;
}

export type BridgeFilterSortStore = BridgeFilterSortState & BridgeFilterSortActions;

export const BRIDGE_FILTER_SORT_STORAGE_KEY = "swipely:bridge-filter-sort";

const STATUS_FILTERS: readonly BridgeStatusFilter[] = [
  "all",
  "healthy",
  "degraded",
  "down",
  "unknown",
] as const;

const SORT_OPTIONS: readonly BridgeSortBy[] = [
  "name",
  "tvl",
  "volume",
  "health",
] as const;

const defaultState: BridgeFilterSortState = {
  statusFilter: "all",
  sortBy: "name",
};

function isStatusFilter(value: unknown): value is BridgeStatusFilter {
  return typeof value === "string" && (STATUS_FILTERS as readonly string[]).includes(value);
}

function isSortBy(value: unknown): value is BridgeSortBy {
  return typeof value === "string" && (SORT_OPTIONS as readonly string[]).includes(value);
}

/**
 * Validate and normalize unknown persisted shapes.
 * Returns defaults for any corrupt or outdated fields.
 */
export function normalizeBridgeFilterSortState(
  raw: unknown
): BridgeFilterSortState {
  if (!raw || typeof raw !== "object") {
    return { ...defaultState };
  }

  const candidate = raw as Record<string, unknown>;
  return {
    statusFilter: isStatusFilter(candidate.statusFilter)
      ? candidate.statusFilter
      : defaultState.statusFilter,
    sortBy: isSortBy(candidate.sortBy) ? candidate.sortBy : defaultState.sortBy,
  };
}

export const useBridgeFilterSortStore = create<BridgeFilterSortStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setStatusFilter: (status) => {
        if (!isStatusFilter(status)) return;
        set({ statusFilter: status });
      },

      setSortBy: (sortBy) => {
        if (!isSortBy(sortBy)) return;
        set({ sortBy });
      },

      reset: () => {
        set({ ...defaultState });
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(BRIDGE_FILTER_SORT_STORAGE_KEY);
          } catch {
            // ignore storage failures
          }
        }
      },
    }),
    {
      name: BRIDGE_FILTER_SORT_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        statusFilter: state.statusFilter,
        sortBy: state.sortBy,
      }),
      migrate: (persisted: unknown) =>
        normalizeBridgeFilterSortState(persisted),
      merge: (persisted, current) => ({
        ...current,
        ...normalizeBridgeFilterSortState(persisted),
      }),
    }
  )
);

export const selectStatusFilter = (state: BridgeFilterSortStore) => state.statusFilter;
export const selectSortBy = (state: BridgeFilterSortStore) => state.sortBy;

/** Simple health score used for client-side bridge sorting (mirrors BridgeCard). */
export function getBridgeHealthScore(bridge: {
  status: string;
  mismatchPercentage: number;
}): number {
  let score = 100;
  if (bridge.status === "down") score -= 50;
  else if (bridge.status === "degraded") score -= 25;
  else if (bridge.status === "unknown") score -= 15;
  if (bridge.mismatchPercentage > 1) score -= 30;
  else if (bridge.mismatchPercentage > 0.5) score -= 15;
  return Math.max(0, score);
}

/**
 * Apply persisted status filter + sort to a bridge list.
 * Unknown volume fields fall back to 0 so sorting remains stable.
 */
export function applyBridgeFilterSort<
  T extends {
    name: string;
    status: string;
    totalValueLocked: number;
    mismatchPercentage: number;
    volume24h?: number;
  },
>(
  bridges: T[],
  statusFilter: BridgeStatusFilter,
  sortBy: BridgeSortBy
): T[] {
  const result =
    statusFilter === "all"
      ? [...bridges]
      : bridges.filter((bridge) => bridge.status === statusFilter);

  result.sort((a, b) => {
    switch (sortBy) {
      case "tvl":
        return b.totalValueLocked - a.totalValueLocked;
      case "volume":
        return (b.volume24h ?? 0) - (a.volume24h ?? 0);
      case "health":
        return getBridgeHealthScore(b) - getBridgeHealthScore(a);
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return result;
}
