import type { Meta, StoryObj } from "@storybook/react";
import BridgeStatusCard, { BridgeStatusCardSkeleton } from "./BridgeStatusCard";

const meta = {
  title: "Components/BridgeStatusCard",
  component: BridgeStatusCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BridgeStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  args: {
    name: "Circle",
    status: "healthy",
    totalValueLocked: 500_000_000,
    supplyOnStellar: 400_000_000,
    supplyOnSource: 400_000_000,
    mismatchPercentage: 0.05,
  },
};

export const Degraded: Story = {
  args: {
    name: "Wormhole",
    status: "degraded",
    totalValueLocked: 200_000_000,
    supplyOnStellar: 180_000_000,
    supplyOnSource: 190_000_000,
    mismatchPercentage: 5.26,
  },
};

export const Down: Story = {
  args: {
    name: "Allbridge",
    status: "down",
    totalValueLocked: 50_000_000,
    supplyOnStellar: 40_000_000,
    supplyOnSource: 50_000_000,
    mismatchPercentage: 20,
  },
};

export const Unknown: Story = {
  args: {
    name: "Unverified Bridge",
    status: "unknown",
    totalValueLocked: 10_000_000,
    supplyOnStellar: 5_000_000,
    supplyOnSource: 8_000_000,
    mismatchPercentage: 37.5,
  },
};

export const Loading: Story = {
  args: {
    name: "",
    status: "healthy",
    totalValueLocked: 0,
    supplyOnStellar: 0,
    supplyOnSource: 0,
    mismatchPercentage: 0,
    isLoading: true,
  },
};

export const SkeletonOnly: Story = {
  render: () => (
    <div style={{ width: "340px" }}>
      <BridgeStatusCardSkeleton />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import BridgeStatusCard from "./BridgeStatusCard";
import FavoriteTagChip from "./favorites/FavoriteTagChip";
import { useState } from "react";

const meta = {
  title: "Swipely/Bridges/BridgeStatusCard",
  component: BridgeStatusCard,
  tags: ["autodocs"],
} satisfies Meta<typeof BridgeStatusCard>;

export default meta;

type Story = StoryObj<typeof BridgeStatusCard>;

const base = {
  name: "Example Bridge",
  status: "healthy" as const,
  totalValueLocked: 12_500_000,
  supplyOnStellar: 5_200_000,
  supplyOnSource: 5_180_000,
  mismatchPercentage: 0.12,
};

export const Default: Story = {
  args: {
    ...base,
  },
};

export const WithFavorite: Story = {
  render: () => {
    const [active, setActive] = useState(false);
    return (
      <BridgeStatusCard
        {...base}
        topRight={
          <FavoriteTagChip
            compact
            label={base.name}
            active={active}
            onToggle={() => setActive((v) => !v)}
          />
        }
      />
    );
  },
};
