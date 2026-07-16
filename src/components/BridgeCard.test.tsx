import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BridgeCard, { BridgeCardSkeleton } from "./BridgeCard";
import type { Bridge, BridgeStats } from "../types";

const mockBridge: Bridge = {
  name: "Circle",
  status: "healthy",
  totalValueLocked: 1_200_000_000,
  supplyOnStellar: 500_000_000,
  supplyOnSource: 500_000_000,
  mismatchPercentage: 0.05,
};

const mockStats: BridgeStats = {
  name: "Circle",
  volume24h: 50_000_000,
  volume7d: 320_000_000,
  volume30d: 1_400_000_000,
  totalTransactions: 12_345,
  averageTransferTime: 45,
  uptime30d: 99.95,
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("BridgeCard", () => {
  describe("rendering", () => {
    it("renders bridge name and status badge", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} />);
      expect(screen.getByText("Circle")).toBeInTheDocument();
      expect(screen.getByText("Healthy")).toBeInTheDocument();
    });

    it("renders a link to bridge details page", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} />);
      const link = screen.getByRole("link", { name: /View details for bridge Circle/ });
      expect(link).toHaveAttribute("href", "/bridges/Circle");
    });

    it("renders health score", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} />);
      expect(screen.getByText("100/100")).toBeInTheDocument();
    });

    it("renders TVL formatted as currency", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} />);
      expect(screen.getByText("$1.20B")).toBeInTheDocument();
    });

    it("renders supply mismatch percentage", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} />);
      expect(screen.getByText("0.050%")).toBeInTheDocument();
    });

    it("renders 24h stats when provided", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={mockStats} />);
      expect(screen.getByText("$50.00M")).toBeInTheDocument();
      expect(screen.getByText("12,345")).toBeInTheDocument();
    });

    it("does not render 24h stats when stats is null", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} />);
      expect(screen.queryByText("24h Volume")).not.toBeInTheDocument();
      expect(screen.queryByText("24h Transactions")).not.toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("renders skeleton when isLoading is true", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} isLoading />);
      expect(screen.queryByText("Circle")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Loading bridge details")).toBeInTheDocument();
    });

    it("renders skeleton without link when loading", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} isLoading />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders real content when isLoading is false", () => {
      renderWithRouter(<BridgeCard bridge={mockBridge} stats={null} isLoading={false} />);
      expect(screen.getByText("Circle")).toBeInTheDocument();
    });
  });

  describe("skeleton component", () => {
    it("renders with accessible label", () => {
      render(<BridgeCardSkeleton />);
      expect(screen.getByLabelText("Loading bridge details")).toBeInTheDocument();
    });

    it("has aria-busy attribute", () => {
      render(<BridgeCardSkeleton />);
      expect(screen.getByLabelText("Loading bridge details")).toHaveAttribute("aria-busy", "true");
    });

    it("accepts className prop", () => {
      const { container } = render(<BridgeCardSkeleton className="custom-class" />);
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("status variants", () => {
    it("shows degraded status correctly", () => {
      const degradedBridge = { ...mockBridge, status: "degraded" as const };
      renderWithRouter(<BridgeCard bridge={degradedBridge} stats={null} />);
      expect(screen.getByText("Degraded")).toBeInTheDocument();
    });

    it("shows down status correctly", () => {
      const downBridge = { ...mockBridge, status: "down" as const };
      renderWithRouter(<BridgeCard bridge={downBridge} stats={null} />);
      expect(screen.getByText("Down")).toBeInTheDocument();
    });
  });
});
