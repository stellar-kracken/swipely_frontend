import { useTranslation } from "react-i18next";
import {
  useBridgeFilterSortStore,
  type BridgeSortBy,
  type BridgeStatusFilter,
} from "../stores/bridgeFilterSortStore";

interface BridgeFilterSortProps {
  /** Optional controlled status filter; defaults to the persisted store value. */
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  /** Optional controlled sort key; defaults to the persisted store value. */
  sortBy?: string;
  onSortByChange?: (sortBy: string) => void;
}

/**
 * Bridge status filter + sort controls.
 * Selections are persisted to localStorage via `useBridgeFilterSortStore`
 * unless fully controlled by the parent through props.
 */
export default function BridgeFilterSort({
  statusFilter: statusFilterProp,
  onStatusFilterChange,
  sortBy: sortByProp,
  onSortByChange,
}: BridgeFilterSortProps = {}) {
  const { t } = useTranslation();
  const storeStatusFilter = useBridgeFilterSortStore((s) => s.statusFilter);
  const storeSortBy = useBridgeFilterSortStore((s) => s.sortBy);
  const setStatusFilter = useBridgeFilterSortStore((s) => s.setStatusFilter);
  const setSortBy = useBridgeFilterSortStore((s) => s.setSortBy);

  const statusFilter = statusFilterProp ?? storeStatusFilter;
  const sortBy = sortByProp ?? storeSortBy;

  const handleStatusChange = (value: string) => {
    if (onStatusFilterChange) {
      onStatusFilterChange(value);
    } else {
      setStatusFilter(value as BridgeStatusFilter);
    }
  };

  const handleSortChange = (value: string) => {
    if (onSortByChange) {
      onSortByChange(value);
    } else {
      setSortBy(value as BridgeSortBy);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-stellar-text-secondary">
          {t("bridges.filterStatusLabel")}
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-stellar-card border border-stellar-border rounded px-3 py-1.5 text-sm text-stellar-text-primary focus:outline-none focus:ring-2 focus:ring-stellar-blue"
        >
          <option value="all">{t("bridges.filterAll")}</option>
          <option value="healthy">{t("bridges.healthy")}</option>
          <option value="degraded">{t("bridges.degraded")}</option>
          <option value="down">{t("bridges.down")}</option>
          <option value="unknown">{t("bridges.unknown")}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="text-sm text-stellar-text-secondary">
          {t("bridges.sortByLabel")}
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="bg-stellar-card border border-stellar-border rounded px-3 py-1.5 text-sm text-stellar-text-primary focus:outline-none focus:ring-2 focus:ring-stellar-blue"
        >
          <option value="name">{t("bridges.sortName")}</option>
          <option value="tvl">{t("bridges.sortTvl")}</option>
          <option value="volume">{t("bridges.sortVolume24h")}</option>
          <option value="health">{t("bridges.sortHealthScore")}</option>
        </select>
      </div>
    </div>
  );
}
