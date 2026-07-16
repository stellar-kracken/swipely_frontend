import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { DataTable } from "./DataTable";
import type { DataTableColumnDef } from "./types";

// ── Mock data ─────────────────────────────────────────────────────────────────

interface BridgeRow {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  tvl: number;
  volume24h: number;
  mismatch: number;
  uptime: number;
  lastUpdated: string;
}

const STATUS_BADGE: Record<BridgeRow["status"], string> = {
  healthy: "bg-green-500/20 text-green-400",
  degraded: "bg-yellow-500/20 text-yellow-400",
  down: "bg-red-500/20 text-red-400",
  unknown: "bg-gray-500/20 text-gray-400",
};

function formatCurrency(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${(n / 1e3).toFixed(2)}K`;
}

const MOCK_BRIDGES: BridgeRow[] = [
  {
    id: "circle",
    name: "Circle",
    status: "healthy",
    tvl: 500_000_000,
    volume24h: 12_400_000,
    mismatch: 0.05,
    uptime: 99.97,
    lastUpdated: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
  {
    id: "wormhole",
    name: "Wormhole",
    status: "degraded",
    tvl: 200_000_000,
    volume24h: 3_200_000,
    mismatch: 5.26,
    uptime: 95.2,
    lastUpdated: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: "allbridge",
    name: "Allbridge",
    status: "healthy",
    tvl: 80_000_000,
    volume24h: 900_000,
    mismatch: 0.12,
    uptime: 99.1,
    lastUpdated: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: "squid",
    name: "Squid Router",
    status: "down",
    tvl: 50_000_000,
    volume24h: 0,
    mismatch: 20.0,
    uptime: 0,
    lastUpdated: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "stargate",
    name: "Stargate",
    status: "unknown",
    tvl: 10_000_000,
    volume24h: 150_000,
    mismatch: 0.3,
    uptime: 78.5,
    lastUpdated: new Date(Date.now() - 60 * 60_000).toISOString(),
  },
];

// Generate a larger dataset for pagination stories
const LARGE_DATASET: BridgeRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `bridge-${i}`,
  name: `Bridge #${i + 1}`,
  status: (["healthy", "degraded", "down", "unknown"] as BridgeRow["status"][])[
    i % 4
  ],
  tvl: Math.round(Math.random() * 1e9),
  volume24h: Math.round(Math.random() * 50e6),
  mismatch: parseFloat((Math.random() * 10).toFixed(2)),
  uptime: parseFloat((70 + Math.random() * 30).toFixed(2)),
  lastUpdated: new Date(Date.now() - i * 3600_000).toISOString(),
}));

// ── Column definitions ────────────────────────────────────────────────────────

const COLUMNS: Array<DataTableColumnDef<BridgeRow>> = [
  {
    id: "name",
    accessorKey: "name",
    header: "Bridge",
    filterType: "text",
    enableSorting: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    filterType: "select",
    filterOptions: [
      { label: "Healthy", value: "healthy" },
      { label: "Degraded", value: "degraded" },
      { label: "Down", value: "down" },
      { label: "Unknown", value: "unknown" },
    ],
    enableSorting: true,
    cell: ({ getValue }) => {
      const v = getValue<BridgeRow["status"]>();
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[v]}`}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      );
    },
  },
  {
    id: "tvl",
    accessorKey: "tvl",
    header: "TVL",
    filterType: "numberRange",
    enableSorting: true,
    cell: ({ getValue }) => formatCurrency(getValue<number>()),
  },
  {
    id: "volume24h",
    accessorKey: "volume24h",
    header: "24h Volume",
    filterType: "numberRange",
    enableSorting: true,
    cell: ({ getValue }) => formatCurrency(getValue<number>()),
  },
  {
    id: "mismatch",
    accessorKey: "mismatch",
    header: "Mismatch %",
    filterType: "numberRange",
    enableSorting: true,
    cell: ({ getValue }) => {
      const v = getValue<number>();
      const cls =
        v > 5 ? "text-red-400" : v > 1 ? "text-yellow-400" : "text-green-400";
      return <span className={cls}>{v.toFixed(2)}%</span>;
    },
  },
  {
    id: "uptime",
    accessorKey: "uptime",
    header: "Uptime (30d)",
    enableSorting: true,
    defaultHidden: true,
    cell: ({ getValue }) => `${getValue<number>().toFixed(1)}%`,
  },
  {
    id: "lastUpdated",
    accessorKey: "lastUpdated",
    header: "Last Updated",
    filterType: "dateRange",
    enableSorting: true,
    defaultHidden: true,
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleString(),
  },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

/**
 * DataTable is a generic component — Meta<typeof DataTable> widens the TData
 * type parameter to `unknown`, which breaks column-definition assignments.
 * We use `render` functions throughout so each story instantiates the concrete
 * BridgeRow type directly, keeping TypeScript happy without any casts.
 */
const meta: Meta = {
  title: "Swipely/Data/DataTable",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Fully populated table with sorting, filtering, export, and row selection */
export const Populated: Story = {
  render: () => (
    <DataTable<BridgeRow>
      title="Bridges"
      description="Live bridge health and volume data."
      data={MOCK_BRIDGES}
      columns={COLUMNS}
      isLoading={false}
    />
  ),
};

/** Loading skeleton state — data prop is empty and isLoading is true */
export const Loading: Story = {
  render: () => (
    <DataTable<BridgeRow>
      title="Bridges"
      data={[]}
      columns={COLUMNS}
      isLoading={true}
    />
  ),
};

/** Empty state — no rows, not loading */
export const Empty: Story = {
  render: () => (
    <DataTable<BridgeRow>
      title="Bridges"
      description="No bridges to display."
      data={[]}
      columns={COLUMNS}
      isLoading={false}
    />
  ),
};

/** Large dataset to demonstrate pagination */
export const Paginated: Story = {
  render: () => (
    <DataTable<BridgeRow>
      title="All Bridges (50 rows)"
      data={LARGE_DATASET}
      columns={COLUMNS}
      isLoading={false}
      pageSizeOptions={[10, 25, 50]}
    />
  ),
};

/** Row-level action menu */
export const WithRowActions: Story = {
  render: () => (
    <DataTable<BridgeRow>
      title="Bridges"
      data={MOCK_BRIDGES}
      columns={COLUMNS}
      isLoading={false}
      rowActions={{
        label: "Actions",
        items: [
          { id: "view", label: "View details", onSelect: action("view-row") },
          { id: "export", label: "Export row", onSelect: action("export-row") },
          { id: "flag", label: "Flag for review", onSelect: action("flag-row") },
        ],
      }}
    />
  ),
};

/** Table with no title or description — just data */
export const NoHeader: Story = {
  render: () => (
    <DataTable<BridgeRow>
      data={MOCK_BRIDGES}
      columns={COLUMNS}
      isLoading={false}
    />
  ),
};

/** Row selection disabled */
export const SelectionDisabled: Story = {
  render: () => (
    <DataTable<BridgeRow>
      title="Bridges (read-only)"
      data={MOCK_BRIDGES}
      columns={COLUMNS}
      isLoading={false}
      enableRowSelection={false}
    />
  ),
};
