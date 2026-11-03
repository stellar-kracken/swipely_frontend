import { Suspense } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import i18n from "../i18n/config";
import type { getBridges } from "../services/api";
import { useBridgeFilterSortStore } from "../stores/bridgeFilterSortStore";
import { useUserPreferencesStore } from "../stores/userPreferencesStore";
import Bridges from "./Bridges";

type BridgesData = Awaited<ReturnType<typeof getBridges>>;

interface MockUseBridgesReturn {
  data: BridgesData | undefined;
  isLoading: boolean;
  refetch: ReturnType<typeof vi.fn>;
}

const sampleBridges: BridgesData = {
  bridges: [
    {
      name: "Circle",
      status: "healthy",
      totalValueLocked: 500_000_000,
      supplyOnStellar: 500_000_000,
      supplyOnSource: 500_000_000,
      mismatchPercentage: 0,
    },
    {
      name: "Wormhole",
      status: "degraded",
      totalValueLocked: 200_000_000,
      supplyOnStellar: 190_000_000,
      supplyOnSource: 200_000_000,
      mismatchPercentage: 5.0,
    },
  ],
};

const useBridgesMock = vi.fn<() => MockUseBridgesReturn>();
const pullRefreshMock = vi.fn(() => Promise.resolve());

vi.mock("../hooks/useBridges", () => ({
  useBridges: () => useBridgesMock(),
}));

vi.mock("../hooks/useRefreshControls", () => ({
  useRefreshControls: () => ({
    preferences: {
      autoRefreshEnabled: false,
      refreshIntervalMs: 30_000,
      refreshOnFocus: false,
      selectedTargetIds: [],
    },
    isRefreshing: false,
    lastUpdatedAt: null,
    setAutoRefreshEnabled: vi.fn(),
    setRefreshIntervalMs: vi.fn(),
    setRefreshOnFocus: vi.fn(),
    setSelectedTargetIds: vi.fn(),
    refreshNow: vi.fn(),
    cancelRefresh: vi.fn(),
  }),
}));

vi.mock("../hooks/usePullToRefresh", () => ({
  usePullToRefresh: () => ({
    isPulling: false,
    pullDistance: 0,
    progress: 0,
    isRefreshing: false,
    refresh: pullRefreshMock,
  }),
}));

vi.mock("../components/BridgeNotesPanel", () => ({
  default: ({ bridgeName }: { bridgeName: string }) => (
    <div data-testid="bridge-notes-panel">{bridgeName}</div>
  ),
}));

function renderBridgesPage(initialEntries: string[] = ["/bridges"]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Suspense fallback={null}>
          <Bridges />
        </Suspense>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Bridges page", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    useBridgeFilterSortStore.getState().reset();
    useUserPreferencesStore.getState().resetPreferences();
    pullRefreshMock.mockClear();
    useBridgesMock.mockReturnValue({
      data: sampleBridges,
      isLoading: false,
      refetch: vi.fn(),
    });
    await i18n.changeLanguage("en");
  });

  it("renders skeleton cards while loading without flashing the empty state", () => {
    useBridgesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    });

    renderBridgesPage();

    expect(screen.getByLabelText("Loading bridge card 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading bridge card 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading bridge card 3")).toBeInTheDocument();
    expect(screen.queryByText("No bridges yet")).not.toBeInTheDocument();
    expect(screen.queryByText("No bridges match your filters")).not.toBeInTheDocument();
  });

  it("shows the default empty state without a clear-filters button when no bridges exist", () => {
    useBridgesMock.mockReturnValue({
      data: { bridges: [] },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderBridgesPage();

    expect(
      screen.getByRole("heading", { name: "No bridges yet", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Swipely hasn't detected any bridges. Data is fetched from the Stellar network automatically — check back shortly.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();
  });

  it("shows the filtered empty state when status filter matches no bridges and resets on click", () => {
    renderBridgesPage();

    expect(
      screen.getByRole("link", { name: "View details for bridge Circle" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View details for bridge Wormhole" }),
    ).toBeInTheDocument();

    const statusSelect = screen.getByLabelText("Status:");
    fireEvent.change(statusSelect, { target: { value: "down" } });

    expect(
      screen.getByRole("heading", { name: "No bridges match your filters", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try adjusting your search or filter criteria to find what you're looking for.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(statusSelect).toHaveValue("all");
    expect(
      screen.getByRole("link", { name: "View details for bridge Circle" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View details for bridge Wormhole" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();
  });

  it("shows the filtered empty state when Favorites only matches nothing and resets both filters", () => {
    renderBridgesPage();

    fireEvent.change(screen.getByLabelText("Status:"), {
      target: { value: "healthy" },
    });
    expect(
      screen.getByRole("link", { name: "View details for bridge Circle" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "View details for bridge Wormhole" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Favorites only" }));

    expect(
      screen.getByRole("heading", { name: "No bridges match your filters", level: 2 }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByLabelText("Status:")).toHaveValue("all");
    expect(screen.getByRole("button", { name: "All bridges" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("link", { name: "View details for bridge Circle" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View details for bridge Wormhole" }),
    ).toBeInTheDocument();
  });

  it("allows clearing persisted filters even when the API returns zero bridges", () => {
    useBridgeFilterSortStore.getState().setStatusFilter("down");
    useBridgesMock.mockReturnValue({
      data: { bridges: [] },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderBridgesPage();

    expect(
      screen.getByRole("heading", { name: "No bridges match your filters", level: 2 }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(
      screen.getByRole("heading", { name: "No bridges yet", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();
  });

  it("does not treat changing sort order as an active filter when no bridges exist", () => {
    useBridgesMock.mockReturnValue({
      data: { bridges: [] },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderBridgesPage();

    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "tvl" },
    });

    expect(
      screen.getByRole("heading", { name: "No bridges yet", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear filters" }),
    ).not.toBeInTheDocument();
  });

  it("translates page headings, filter controls, and empty-state copy via react-i18next", async () => {
    renderBridgesPage();

    await act(async () => {
      await i18n.changeLanguage("es");
    });

    expect(
      screen.getByRole("heading", { name: "Puentes", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Estado:")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordenar por:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Solo favoritos" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Solo favoritos" }));

    expect(
      screen.getByRole("heading", {
        name: "Ningún puente coincide con tus filtros",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Intenta ajustar tu búsqueda o los criterios de filtro para encontrar lo que buscas.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Borrar filtros" }),
    ).toBeInTheDocument();
  });

  it("supports starring a bridge, switching between filter toggles, refreshing, and opening notes", () => {
    renderBridgesPage(["/bridges?selected=Circle"]);

    expect(screen.getByTestId("bridge-notes-panel")).toHaveTextContent("Circle");

    fireEvent.click(screen.getByRole("switch", { name: "Add Circle to favorites" }));
    expect(useUserPreferencesStore.getState().favoriteBridges).toContain("Circle");

    fireEvent.click(screen.getByRole("button", { name: "Favorites only" }));
    expect(
      screen.getByRole("link", { name: "View details for bridge Circle" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "View details for bridge Wormhole" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All bridges" }));
    expect(
      screen.getByRole("link", { name: "View details for bridge Wormhole" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Refresh now" }));
    expect(pullRefreshMock).toHaveBeenCalledTimes(1);
  });
});
