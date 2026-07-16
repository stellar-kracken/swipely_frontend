import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BridgeStatusCard, { BridgeStatusCardSkeleton } from "./BridgeStatusCard";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("BridgeStatusCard", () => {
  const defaultProps = {
    name: "Circle",
    status: "healthy" as const,
    totalValueLocked: 500_000_000,
    supplyOnStellar: 400_000_000,
    supplyOnSource: 400_000_000,
    mismatchPercentage: 0.123,
  };

  describe("rendering", () => {
    it("renders bridge name and status", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} />);
      expect(screen.getByText("Circle")).toBeInTheDocument();
      expect(screen.getByText("Healthy")).toBeInTheDocument();
    });

    it("renders a link to bridge details", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} />);
      const link = screen.getByRole("link", { name: /View details for bridge Circle/ });
      expect(link).toHaveAttribute("href", "/bridges?selected=Circle");
    });

    it("renders TVL formatted as currency", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} />);
      expect(screen.getByText("$500.00M")).toBeInTheDocument();
    });

    it("renders supply numbers with locale formatting", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} />);
      const supplyNumbers = screen.getAllByText("400,000,000");
      expect(supplyNumbers).toHaveLength(2);
    });

    it("renders mismatch percentage", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} />);
      expect(screen.getByText("0.123%")).toBeInTheDocument();
    });

    it("applies topRight content", () => {
      renderWithRouter(
        <BridgeStatusCard {...defaultProps} topRight={<span data-testid="chip">★</span>} />
      );
      expect(screen.getByTestId("chip")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("renders skeleton when isLoading is true", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} isLoading />);
      expect(screen.queryByText("Circle")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Loading bridge status")).toBeInTheDocument();
    });

    it("renders skeleton without link when loading", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} isLoading />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders real content when isLoading is false", () => {
      renderWithRouter(<BridgeStatusCard {...defaultProps} isLoading={false} />);
      expect(screen.getByText("Circle")).toBeInTheDocument();
    });
  });

  describe("skeleton component", () => {
    it("renders with accessible label", () => {
      renderWithRouter(<BridgeStatusCardSkeleton />);
      expect(screen.getByLabelText("Loading bridge status")).toBeInTheDocument();
    });

    it("has aria-busy attribute", () => {
      renderWithRouter(<BridgeStatusCardSkeleton />);
      expect(screen.getByLabelText("Loading bridge status")).toHaveAttribute("aria-busy", "true");
    });

    it("accepts className prop", () => {
      const { container } = renderWithRouter(<BridgeStatusCardSkeleton className="custom-class" />);
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("renders topRight content when provided", () => {
      renderWithRouter(
        <BridgeStatusCardSkeleton topRight={<span data-testid="chip">★</span>} />
      );
      expect(screen.getByTestId("chip")).toBeInTheDocument();
    });
  });
});
