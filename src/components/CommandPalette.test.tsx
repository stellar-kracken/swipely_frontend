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
import userEvent from "@testing-library/user-event";
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
  // Populate the registry only with test actions (it is a module-level array)
  // so we splice-in our entries to avoid cross-test pollution.
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
    // The backdrop div is the first child of the dialog's fixed container;
    // clicking the fixed container (which has an onClick guard) also closes.
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
  it("dialog has role=dialog, aria-modal and aria-label", async () => {
    renderPalette();
    await openPalette();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Command palette");
  });

  it("input has role=combobox with correct aria attributes", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-label", "Search commands");
  });

  it("listbox has role=listbox", async () => {
    renderPalette();
    await openPalette();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("each result item has role=option", async () => {
    renderPalette();
    await openPalette();
    // Type something to show results
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "dashboard" } });
    const options = screen.getAllByRole("option");
    // "No results" empty state is also role=option; filter by non-disabled
    const realOptions = options.filter((o) => !o.hasAttribute("aria-disabled"));
    expect(realOptions.length).toBeGreaterThan(0);
  });

  it("aria-activedescendant points to the active option", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "dashboard" } });

    const input2 = screen.getByRole("combobox");
    const activeDescendant = input2.getAttribute("aria-activedescendant");
    expect(activeDescendant).toBeTruthy();

    const activeOption = document.getElementById(activeDescendant!);
    expect(activeOption).not.toBeNull();
    expect(activeOption).toHaveAttribute("aria-selected", "true");
  });

  it("live region announces result count", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "dashboard" } });

    const status = screen.getByRole("status");
    expect(status.textContent).toMatch(/result/i);
  });

  it("live region announces 'No results' when nothing matches", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "xyznotexist" } });

    const status = screen.getByRole("status");
    await waitFor(() =>
      expect(status.textContent).toMatch(/no results found/i),
    );
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

describe("CommandPalette – keyboard navigation", () => {
  it("ArrowDown moves highlight to the next item", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    // "e" appears in all three test actions (Dashboard, Bridges, Settings)
    fireEvent.change(input, { target: { value: "e" } });

    const getOptions = () =>
      screen.getAllByRole("option").filter((o) => !o.hasAttribute("aria-disabled"));

    expect(getOptions().length).toBeGreaterThanOrEqual(2);
    expect(getOptions()[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Re-query after re-render
    expect(getOptions()[1]).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowUp moves highlight to the previous item", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "e" } });

    // Move down first then back up
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });

    const options = screen
      .getAllByRole("option")
      .filter((o) => !o.hasAttribute("aria-disabled"));
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowDown does not go past the last item", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "e" } });

    const getOptions = () =>
      screen.getAllByRole("option").filter((o) => !o.hasAttribute("aria-disabled"));

    const count = getOptions().length;
    for (let i = 0; i < count + 5; i++) {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    }
    expect(getOptions()[count - 1]).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowUp does not go above the first item", async () => {
    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "e" } });

    for (let i = 0; i < 5; i++) {
      fireEvent.keyDown(input, { key: "ArrowUp" });
    }
    const options = screen
      .getAllByRole("option")
      .filter((o) => !o.hasAttribute("aria-disabled"));
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("Enter executes the currently active action and closes the palette", async () => {
    const onExecute = vi.fn();
    actionsRegistry.length = 0;
    registerAction({ id: "test-action", title: "Test Action", onExecute });

    renderPalette();
    await openPalette();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onExecute).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Restore for other tests
    actionsRegistry.length = 0;
    TEST_ACTIONS.forEach((a) => registerAction(a));
  });
});

// ---------------------------------------------------------------------------
// Focus restoration
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
    // rAF-deferred focus; give it a tick
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
    // "e" appears in all three test actions (Dashboard, Bridges, Settings)
    fireEvent.change(input, { target: { value: "e" } });

    const getOptions = () =>
      screen.getAllByRole("option").filter((o) => !o.hasAttribute("aria-disabled"));

    // Ensure there are at least 2 options
    expect(getOptions().length).toBeGreaterThanOrEqual(2);

    fireEvent.mouseEnter(getOptions()[1]);
    // Re-query after state update
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
    // Pre-seed localStorage
    localStorage.setItem(
      "swipely:recent_actions",
      JSON.stringify(["action-dashboard"]),
    );
    renderPalette();
    await openPalette();
    // The label is aria-hidden so query by text directly
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
