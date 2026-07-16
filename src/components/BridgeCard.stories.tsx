import type { Meta, StoryObj } from "@storybook/react";
import BridgeCard from "./BridgeCard";
import type { Bridge, BridgeStats } from "../types";

const meta = {
  title: "Swipely/Bridges/BridgeCard",
  component: BridgeCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    bridge: { control: "object" },
    stats: { control: "object" },
  },
} satisfies Meta<typeof BridgeCard>;

export default meta;

type Story = StoryObj<typeof BridgeCard>;

// ── Mock data ─────────────────────────────────────────────────────────────────

const healthyBridge: Bridge = {
  name: "Circle",
  status: "healthy",
  totalValueLocked: 500_000_000,
  supplyOnStellar: 400_000_000,
  supplyOnSource: 400_000_000,
  mismatchPercentage: 0.05,
};

const degradedBridge: Bridge = {
  name: "Wormhole",
  status: "degraded",
  totalValueLocked: 200_000_000,
  supplyOnStellar: 180_000_000,
  supplyOnSource: 190_000_000,
  mismatchPercentage: 5.26,
};

const downBridge: Bridge = {
  name: "DownBridge",
  status: "down",
  totalValueLocked: 50_000_000,
  supplyOnStellar: 40_000_000,
  supplyOnSource: 50_000_000,
  mismatchPercentage: 20,
};

const unknownBridge: Bridge = {
  name: "UnknownBridge",
  status: "unknown",
  totalValueLocked: 10_000_000,
  supplyOnStellar: 9_500_000,
  supplyOnSource: 9_500_000,
  mismatchPercentage: 0,
};

const mockStats: BridgeStats = {
  name: "Circle",
  volume24h: 12_400_000,
  volume7d: 78_000_000,
  volume30d: 310_000_000,
  totalTransactions: 1_430,
  averageTransferTime: 42,
  uptime30d: 99.97,
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** Healthy bridge with full stats populated */
export const Healthy: Story = {
  args: {
    bridge: healthyBridge,
    stats: mockStats,
  },
};

/** Bridge operating in a degraded state — elevated mismatch percentage */
export const Degraded: Story = {
  args: {
    bridge: degradedBridge,
    stats: { ...mockStats, name: "Wormhole", volume24h: 3_200_000, totalTransactions: 210 },
  },
};

/** Bridge completely offline */
export const Down: Story = {
  args: {
    bridge: downBridge,
    stats: null,
  },
};

/** Bridge in an unknown / unreachable state */
export const Unknown: Story = {
  args: {
    bridge: unknownBridge,
    stats: null,
  },
};

/** Stats are still loading — the stats panel is omitted */
export const NoStats: Story = {
  args: {
    bridge: healthyBridge,
    stats: null,
  },
};

/** Very large TVL formatted as billions */
export const LargeTVL: Story = {
  args: {
    bridge: { ...healthyBridge, name: "MegaBridge", totalValueLocked: 4_200_000_000 },
    stats: { ...mockStats, volume24h: 400_000_000 },
  },
};

/** Bridge name that is long enough to test truncation */
export const LongName: Story = {
  args: {
    bridge: {
      ...healthyBridge,
      name: "Cross-Chain Stellar Asset Bridge v2",
    },
    stats: mockStats,
  },
};
