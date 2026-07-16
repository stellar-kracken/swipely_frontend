import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, userEvent } from "../../test/utils";
import RouteErrorBoundary from "./RouteErrorBoundary";
import { clearErrorLog, getErrorLog } from "./errorReporting";

const originalConsoleError = console.error;
beforeEach(() => {
  clearErrorLog();
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

function AlwaysThrow(): JSX.Element {
  throw new Error("Route boom");
}

function FlakyRoute({ fail }: { fail: boolean }): JSX.Element {
  if (fail) {
    throw new Error("Transient route failure");
  }
  return <div>Route recovered</div>;
}

describe("RouteErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <RouteErrorBoundary context="Route:/dashboard">
        <div>Dashboard content</div>
      </RouteErrorBoundary>
    );
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });

  it("catches a render error and shows a friendly route fallback", () => {
    render(
      <RouteErrorBoundary context="Route:/bridge-topology">
        <AlwaysThrow />
      </RouteErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This page crashed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("logs the error with a reference id via the reporting path", () => {
    render(
      <RouteErrorBoundary context="Route:/liquidity-dashboard" severity="high">
        <AlwaysThrow />
      </RouteErrorBoundary>
    );
    const log = getErrorLog();
    expect(log).toHaveLength(1);
    expect(log[0].context).toBe("Route:/liquidity-dashboard");
    expect(log[0].severity).toBe("high");
    expect(log[0].id).toMatch(/^err-/);
    expect(screen.getByTestId("error-reference-id")).toHaveTextContent(log[0].id);
  });

  it("surfaces a copyable error reference", () => {
    render(
      <RouteErrorBoundary context="Route:/test">
        <AlwaysThrow />
      </RouteErrorBoundary>
    );
    expect(screen.getByTestId("error-reference")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy error reference/i })).toBeInTheDocument();
  });

  it("Try again remounts the route and recovers when the error is gone", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [fail, setFail] = useState(true);
      return (
        <RouteErrorBoundary
          context="Route:/retry"
          onReset={() => {
            setFail(false);
          }}
        >
          <FlakyRoute fail={fail} />
        </RouteErrorBoundary>
      );
    }

    render(<Harness />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(screen.getByText("Route recovered")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onError when a route crashes", () => {
    const onError = vi.fn();
    render(
      <RouteErrorBoundary context="Route:/x" onError={onError}>
        <AlwaysThrow />
      </RouteErrorBoundary>
    );
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("isolates errors so siblings outside the boundary still render", () => {
    render(
      <div>
        <nav>App shell nav</nav>
        <RouteErrorBoundary context="Route:/crashed">
          <AlwaysThrow />
        </RouteErrorBoundary>
      </div>
    );
    expect(screen.getByText("App shell nav")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
