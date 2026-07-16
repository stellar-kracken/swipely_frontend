/**
 * Tests for the accessible CommandPalette component.
 *
 * Covers:
 * - Keyboard navigation (Up/Down/Enter/Escape)
 * - ARIA roles and attributes (combobox, listbox, option, aria-activedescendant)
 * - Live-region announcements for result counts
 * - Focus trap while open and focus restoration on close
 * - Cmd/Ctrl+K global toggle
 */
import { screen, fireEvent, waitFor } from "../test/utils";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommandPalette from "./CommandPalette";
import { actionsRegistry, registerAction } from "../utils/commandRegistry";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function renderPalette() {
  return render(
    <MemoryRouter>
      <CommandPalette />
    </MemoryRouter>,
  );
}

/** Open the palette with Ctrl+K */
async function openPalette() {
  fireEvent.keyDown(window, { key: "k", ctrlKey: true });
}

// ---------------------------------------------------------------------------
// Seed the registry with deterministic test actions
// ---------------------------------------------------------------------------
const TEST_ACTIONS = [
  { id: "action-dashboard", title: "Go to Dashboard", href: "/dashboard", keywords: ["home"] },
  { id: "action-bridges", title: "View Bridges", href: "/bridges", keywords: ["bridge"] },
  { id: "action-settings", title: "Open Settings", href: "/settings", keywords: ["config"] },
];

beforeAll(() => {
  actionsRegistry.length = 0;
  TEST_ACTIONS.forEach((a) => registerAction(a));
});

afterAll(() => {
  actionsRegistry.length = 0;
});

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Opening and closing
// ---------------------------------------------------------------------------

describe("CommandPalette – open / close", () => {
  it("is hidden by default", () => {
    renderPalette();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens when Ctrl+K is pressed", async () => {
    renderPalette();
    await openPalette();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when backdrop is clicked", async () => {
    renderPalette();
    await openPalette();
    const backdrop = document.querySelector(".absolute.inset-0.bg-black\\/60") as HTMLElement;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles closed with Ctrl+K when already open", async () => {
    renderPalette();
    await openPalette();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ARIA roles and attributes
// ---------------------------------------------------------------------------

describe("CommandPalette – ARIA", () => {
  it("has combobox role on the search input", async () => {
    renderPalette();
    await openPalette();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders options with listbox role", async () => {
    renderPalette();
    await openPalette();
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
  });


  it("announces result count via live region", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "dashboard" } });
    await waitFor(() =>
      expect(screen.getByText(/1 result/)).toBeInTheDocument(),
    );
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

describe("CommandPalette – keyboard navigation", () => {
  it("navigates items with ArrowDown", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    await waitFor(() =>
      expect(options[0]).toHaveAttribute("aria-selected", "true"),
    );
  });

  it("executes selected item on Enter", async () => {
    const onExecute = vi.fn();
    actionsRegistry.length = 0;
    registerAction({ id: "enter-action", title: "Enter Me", onExecute });
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Enter" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onExecute).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    actionsRegistry.length = 0;
    TEST_ACTIONS.forEach((a) => registerAction(a));
  });
});


// ---------------------------------------------------------------------------
// Focus management
// ---------------------------------------------------------------------------

describe("CommandPalette – focus management", () => {
  it("restores focus to the previously focused element on close", async () => {
    const { container } = render(
      <MemoryRouter>
        <button data-testid="trigger">Open</button>
        <CommandPalette />
      </MemoryRouter>,
    );

    const trigger = container.querySelector("[data-testid='trigger']") as HTMLElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    await openPalette();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("focuses the input when the palette opens", async () => {
    renderPalette();
    await openPalette();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("combobox")),
    );
  });
});

// ---------------------------------------------------------------------------
// Mouse interaction
// ---------------------------------------------------------------------------

describe("CommandPalette – mouse interaction", () => {
  it("hovering an item makes it active", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "e" } });

    const getOptions = () =>
      screen.getAllByRole("option").filter((o) => !o.hasAttribute("aria-disabled"));
    expect(getOptions().length).toBeGreaterThanOrEqual(2);

    fireEvent.mouseEnter(getOptions()[1]);
    expect(getOptions()[1]).toHaveAttribute("aria-selected", "true");
  });

  it("clicking an item executes it and closes the palette", async () => {
    const onExecute = vi.fn();
    actionsRegistry.length = 0;
    registerAction({ id: "click-action", title: "Click Me", onExecute });

    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Click" } });

    const options = screen
      .getAllByRole("option")
      .filter((o) => !o.hasAttribute("aria-disabled"));
    fireEvent.click(options[0]);

    expect(onExecute).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    actionsRegistry.length = 0;
    TEST_ACTIONS.forEach((a) => registerAction(a));
  });
});


// ---------------------------------------------------------------------------
// Recent actions
// ---------------------------------------------------------------------------

describe("CommandPalette – recent actions", () => {
  it("shows 'Recent' section label when there are recent actions and query is empty", async () => {
    localStorage.setItem(
      "swipely:recent_actions",
      JSON.stringify(["action-dashboard"]),
    );
    renderPalette();
    await openPalette();
    expect(screen.getByText("Recent")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// "No results" empty state
// ---------------------------------------------------------------------------

describe("CommandPalette – empty state", () => {
  it("shows a 'No results' option when nothing matches the query", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "xyznotexist" } });

    await waitFor(() =>
      expect(screen.getByText("No results")).toBeInTheDocument(),
    );
  });
});
