import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import i18n from "../i18n/config";
import ConnectionStatus from "./ConnectionStatus";

const mockWebSocket = {
  connectionState: "connected" as const,
  isPollingFallback: false,
  send: vi.fn(),
  subscribe: vi.fn(() => () => {}),
};

vi.mock("../contexts/WebSocketContextValue", () => ({
  useWebSocketContext: () => mockWebSocket,
}));

function renderStatus(ui: React.ReactElement, client?: QueryClient) {
  const queryClient =
    client ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>{ui}</Suspense>
      </QueryClientProvider>,
    ),
  };
}

describe("ConnectionStatus", () => {
  beforeEach(async () => {
    mockWebSocket.connectionState = "connected";
    mockWebSocket.isPollingFallback = false;
    await i18n.changeLanguage("en");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows connection status with a relative last-updated label", () => {
    const updatedAt = Date.now() - 12_000;
    renderStatus(<ConnectionStatus updatedAt={updatedAt} />);

    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
    expect(screen.getByText(/12 second/i)).toBeInTheDocument();
  });

  it("exposes the exact timestamp on hover/focus via title", () => {
    const updatedAt = Date.parse("2026-07-16T11:59:00.000Z");
    renderStatus(<ConnectionStatus updatedAt={updatedAt} />);

    const exact = screen.getByLabelText(/Last updated:/i);
    expect(exact).toHaveAttribute("title", expect.stringContaining("Last updated:"));
    expect(exact.getAttribute("title")).toMatch(/2026|7\/16|16\/7|16\.7/);
  });

  it("updates the relative label as time passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00.000Z"));

    const updatedAt = Date.now() - 10_000;
    renderStatus(<ConnectionStatus updatedAt={updatedAt} />);

    expect(screen.getByText(/10 second/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(screen.getByText(/15 second/i)).toBeInTheDocument();
  });

  it("shows polling label when the socket is in polling fallback", () => {
    mockWebSocket.isPollingFallback = true;
    renderStatus(<ConnectionStatus updatedAt={Date.now()} />);

    expect(screen.getByText("Polling")).toBeInTheDocument();
  });

  it("reads the latest TanStack Query dataUpdatedAt when updatedAt is omitted", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    queryClient.setQueryData(["assets"], { items: [] });
    const query = queryClient.getQueryCache().find({ queryKey: ["assets"] });
    if (query) {
      query.state.dataUpdatedAt = Date.now() - 30_000;
    }

    renderStatus(<ConnectionStatus />, queryClient);

    expect(screen.getByText(/30 second/i)).toBeInTheDocument();
  });

  it("shows a never-updated label when no timestamp is available", () => {
    renderStatus(<ConnectionStatus updatedAt={null} />);

    expect(screen.getByText(/not updated yet/i)).toBeInTheDocument();
  });
});
