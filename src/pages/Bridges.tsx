import { Suspense, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useBridges } from "../hooks/useBridges";
import { useFavorites } from "../hooks/useFavorites";
import { useRefreshControls } from "../hooks/useRefreshControls";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import BridgeStatusCard from "../components/BridgeStatusCard";
import BridgeFilterSort from "../components/BridgeFilterSort";
import BridgeNotesPanel from "../components/BridgeNotesPanel";
import FavoriteTagChip from "../components/favorites/FavoriteTagChip";
import RefreshControls from "../components/RefreshControls";
import PullToRefresh from "../components/PullToRefresh";
import { SkeletonCard, ErrorBoundary } from "../components/Skeleton";
import { EmptyBridges } from "../components/EmptyState";
import {
  applyBridgeFilterSort,
  useBridgeFilterSortStore,
} from "../stores/bridgeFilterSortStore";

export default function Bridges() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedBridge = searchParams.get("selected") ?? null;

  const {
    favoritesFilterMode,
    setFavoritesFilterMode,
    toggleFavoriteBridge,
    favoriteBridges,
  } = useFavorites();

  const statusFilter = useBridgeFilterSortStore((s) => s.statusFilter);
  const sortBy = useBridgeFilterSortStore((s) => s.sortBy);
  const setStatusFilter = useBridgeFilterSortStore((s) => s.setStatusFilter);

  const hasActiveFilters = statusFilter !== "all" || favoritesFilterMode !== "all";

  const handleClearFilters = useCallback(() => {
    setFavoritesFilterMode("all");
    setStatusFilter("all");
  }, [setFavoritesFilterMode, setStatusFilter]);

  const bridgeStatusLabel = t("bridges.bridgeStatus");

  const refreshControls = useRefreshControls({
    viewId: "bridges",
    targets: [{ id: "bridges", label: bridgeStatusLabel, queryKey: ["bridges"] }],
    defaultIntervalMs: 30_000,
  });

  const { data, isLoading, refetch } = useBridges({
    refetchInterval: refreshControls.preferences.autoRefreshEnabled
      ? refreshControls.preferences.refreshIntervalMs
      : false,
    refetchOnWindowFocus: refreshControls.preferences.refreshOnFocus,
  });
  const pullToRefresh = usePullToRefresh({
    enabled: true,
    onRefresh: refreshControls.refreshNow,
  });

  const filteredBridges = useMemo(() => {
    const bridges = data?.bridges ?? [];
    const favoriteScoped =
      favoritesFilterMode === "favorites"
        ? bridges.filter((b) => favoriteBridges.includes(b.name))
        : bridges;
    return applyBridgeFilterSort(favoriteScoped, statusFilter, sortBy);
  }, [data?.bridges, favoritesFilterMode, favoriteBridges, statusFilter, sortBy]);

  const loadingGrid = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} rows={6} ariaLabel={t("bridges.loadingCard", { index: i })} />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <PullToRefresh
        isPulling={pullToRefresh.isPulling}
        pullDistance={pullToRefresh.pullDistance}
        progress={pullToRefresh.progress}
        isRefreshing={pullToRefresh.isRefreshing}
      />

      <div>
        <h1 className="text-3xl font-bold text-stellar-text-primary">{t("bridges.title")}</h1>
        <p className="mt-2 text-stellar-text-secondary">{t("bridges.subtitle")}</p>
      </div>

      <RefreshControls
        autoRefreshEnabled={refreshControls.preferences.autoRefreshEnabled}
        onAutoRefreshEnabledChange={refreshControls.setAutoRefreshEnabled}
        refreshIntervalMs={refreshControls.preferences.refreshIntervalMs}
        onRefreshIntervalChange={refreshControls.setRefreshIntervalMs}
        refreshOnFocus={refreshControls.preferences.refreshOnFocus}
        onRefreshOnFocusChange={refreshControls.setRefreshOnFocus}
        targets={[{ id: "bridges", label: bridgeStatusLabel, refetch }]}
        selectedTargetIds={refreshControls.preferences.selectedTargetIds}
        onSelectedTargetIdsChange={refreshControls.setSelectedTargetIds}
        onRefresh={refreshControls.refreshNow}
        onCancelRefresh={refreshControls.cancelRefresh}
        isRefreshing={refreshControls.isRefreshing}
        lastUpdatedAt={refreshControls.lastUpdatedAt}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BridgeFilterSort />
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-stellar-border p-0.5">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                favoritesFilterMode === "all"
                  ? "bg-stellar-blue text-stellar-ink"
                  : "text-stellar-text-secondary hover:text-stellar-text-primary"
              }`}
              aria-pressed={favoritesFilterMode === "all"}
              onClick={() => setFavoritesFilterMode("all")}
            >
              {t("bridges.allBridges")}
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                favoritesFilterMode === "favorites"
                  ? "bg-stellar-blue text-stellar-ink"
                  : "text-stellar-text-secondary hover:text-stellar-text-primary"
              }`}
              aria-pressed={favoritesFilterMode === "favorites"}
              onClick={() => setFavoritesFilterMode("favorites")}
            >
              {t("bridges.favoritesOnly")}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              void pullToRefresh.refresh();
            }}
            className="rounded-md border border-stellar-border px-4 py-2 text-sm text-stellar-text-primary hover:bg-stellar-border"
          >
            {t("bridges.refreshNow")}
          </button>
        </div>
      </div>

      <ErrorBoundary onRetry={() => window.location.reload()}>
        <Suspense fallback={loadingGrid}>
          {isLoading ? (
            loadingGrid
          ) : filteredBridges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBridges.map((bridge) => (
                <BridgeStatusCard
                  key={bridge.name}
                  {...bridge}
                  topRight={
                    <FavoriteTagChip
                      compact
                      label={bridge.name}
                      active={favoriteBridges.includes(bridge.name)}
                      onToggle={() => toggleFavoriteBridge(bridge.name)}
                    />
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyBridges
              hasFilters={hasActiveFilters}
              onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
            />
          )}
        </Suspense>
      </ErrorBoundary>

      <div className="bg-stellar-card border border-stellar-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-stellar-text-primary mb-4">
          {t("bridges.performanceTitle")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{t("bridges.performanceTableCaption")}</caption>
            <thead>
              <tr className="text-left text-stellar-text-secondary border-b border-stellar-border">
                <th scope="col" className="pb-3 pr-4">
                  {t("bridges.columnBridge")}
                </th>
                <th scope="col" className="pb-3 pr-4">
                  {t("bridges.columnVolume24h")}
                </th>
                <th scope="col" className="pb-3 pr-4">
                  {t("bridges.columnVolume7d")}
                </th>
                <th scope="col" className="pb-3 pr-4">
                  {t("bridges.columnAvgTransferTime")}
                </th>
                <th scope="col" className="pb-3">
                  {t("bridges.columnUptime30d")}
                </th>
              </tr>
            </thead>
            <tbody className="text-stellar-text-primary">
              <tr>
                <td colSpan={5} className="py-6 text-center text-stellar-text-secondary">
                  {t("bridges.performanceEmpty")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Bridge notes panel — shown when a bridge card is clicked */}
      {selectedBridge && <BridgeNotesPanel bridgeName={selectedBridge} />}
    </div>
  );
}
