import type { Meta, StoryObj } from "@storybook/react";
import { AssetStatusBadge } from "./AssetStatusBadge";
import type { AssetStatus, BadgeSize } from "./AssetStatusBadge";

const meta = {
  title: "Swipely/Assets/AssetStatusBadge",
  component: AssetStatusBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    status: {
      control: "select",
      options: [
        "healthy",
        "warning",
        "critical",
        "unknown",
        "paused",
        "syncing",
      ] satisfies AssetStatus[],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"] satisfies BadgeSize[],
    },
    dot: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof AssetStatusBadge>;

export default meta;

type Story = StoryObj<typeof AssetStatusBadge>;

// ── Single status stories ─────────────────────────────────────────────────────

export const Healthy: Story = {
  args: { status: "healthy" },
};

export const Warning: Story = {
  args: { status: "warning" },
};

export const Critical: Story = {
  args: { status: "critical" },
};

export const Unknown: Story = {
  args: { status: "unknown" },
};

export const Paused: Story = {
  args: { status: "paused" },
};

export const Syncing: Story = {
  args: { status: "syncing" },
};

// ── Size variants ─────────────────────────────────────────────────────────────

export const SmallSize: Story = {
  args: { status: "healthy", size: "sm" },
};

export const MediumSize: Story = {
  args: { status: "healthy", size: "md" },
};

export const LargeSize: Story = {
  args: { status: "healthy", size: "lg" },
};

// ── Dot mode ──────────────────────────────────────────────────────────────────

/** Dot-only rendering — useful in dense tables */
export const DotHealthy: Story = {
  args: { status: "healthy", dot: true },
};

export const DotCritical: Story = {
  args: { status: "critical", dot: true },
};

export const DotSyncing: Story = {
  args: { status: "syncing", dot: true },
};

// ── Custom label ──────────────────────────────────────────────────────────────

export const CustomLabel: Story = {
  args: { status: "warning", label: "Needs review" },
};

// ── All statuses in a row (grid story) ───────────────────────────────────────

const ALL_STATUSES: AssetStatus[] = [
  "healthy",
  "warning",
  "critical",
  "unknown",
  "paused",
  "syncing",
];

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {ALL_STATUSES.map((s) => (
        <AssetStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(["sm", "md", "lg"] as BadgeSize[]).map((sz) => (
        <AssetStatusBadge key={sz} status="healthy" size={sz} />
      ))}
    </div>
  ),
};

/** All statuses in dot mode side-by-side */
export const AllDots: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {ALL_STATUSES.map((s) => (
        <span key={s} className="flex flex-col items-center gap-1">
          <AssetStatusBadge status={s} dot />
          <span className="text-xs text-stellar-text-secondary capitalize">{s}</span>
        </span>
      ))}
    </div>
  ),
};
