import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "../test/utils";
import CopyButton from "./CopyButton";

describe("CopyButton", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => true),
    });
  });

  it("copies plain text and shows success feedback", async () => {
    render(<CopyButton value="0xabc123" label="Copy hash" copiedLabel="Copied" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy hash" }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0xabc123");
    });

    expect(screen.getByRole("button", { name: /Copy hash/ })).toHaveTextContent(
      "Copied"
    );
  });

  it("shows check icon when copy succeeds", async () => {
    render(<CopyButton value="test-value" label="Copy" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      // The check icon is rendered inside the button with aria-hidden
      const button = screen.getByRole("button", { name: /Copy/ });
      expect(button.querySelector("svg")).toBeTruthy();
    });
  });

  it("updates aria-label to include copied state for screen readers", async () => {
    render(<CopyButton value="test-value" label="Copy" copiedLabel="Copied!" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copy - Copied!" })
      ).toBeInTheDocument();
    });
  });

  it("announces copy status to screen readers via aria-live region", async () => {
    render(<CopyButton value="test-value" label="Copy" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
      expect(liveRegion).toHaveTextContent("Copied to clipboard");
    });
  });

  it("reverts to original label after success duration", async () => {
    render(
      <CopyButton
        value="test-value"
        label="Copy"
        copiedLabel="Copied!"
        successDurationMs={100}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copy - Copied!" })
      ).toHaveTextContent("Copied!");
    });

    // Wait for the success duration to expire and label to revert
    await waitFor(
      () => {
        expect(screen.getByRole("button", { name: "Copy" })).toHaveTextContent(
          "Copy"
        );
      },
      { timeout: 3000 }
    );
  });

  it("handles rapid repeated clicks without visual glitches", async () => {
    render(
      <CopyButton
        value="test-value"
        label="Copy"
        copiedLabel="Copied!"
        successDurationMs={200}
      />
    );

    const button = screen.getByRole("button", { name: "Copy" });

    // Click rapidly multiple times
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      // Should show success state after the last click
      expect(button).toHaveTextContent("Copied!");
    });

    // After the duration, should revert once
    await waitFor(
      () => {
        expect(button).toHaveTextContent("Copy");
      },
      { timeout: 3000 }
    );
  });

  it("uses i18n default labels when no explicit labels provided", async () => {
    render(<CopyButton value="test-value" />);

    const button = screen.getByRole("button", { name: "Copy" });
    expect(button).toHaveTextContent("Copy");

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent("Copied!");
    });
  });

  it("supports keyboard shortcut copy while focused", async () => {
    render(<CopyButton value="tx-42" label="Copy" />);

    const button = screen.getByRole("button", { name: "Copy" });
    fireEvent.keyDown(button, { key: "c", ctrlKey: true });

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("tx-42");
    });
  });

  it("shows failed feedback if clipboard and fallback copy fail", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("copy denied")),
      },
    });

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => false),
    });

    render(<CopyButton value="cannot-copy" label="Copy" failedLabel="Failed" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy" })).toHaveTextContent(
        "Failed"
      );
    });
  });

  it("does not show check icon when copy fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("copy denied")),
      },
    });

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => false),
    });

    render(<CopyButton value="cannot-copy" label="Copy" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "Copy" });
      expect(button.querySelector("svg")).toBeFalsy();
    });
  });
});
