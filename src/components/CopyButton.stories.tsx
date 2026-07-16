import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import CopyButton from "./CopyButton";

const meta = {
  title: "Swipely/UI/CopyButton",
  component: CopyButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["button", "inline"],
    },
    label: { control: "text" },
    copiedLabel: { control: "text" },
    failedLabel: { control: "text" },
    value: { control: "text" },
    format: {
      control: "select",
      options: ["text", "json"],
    },
  },
} satisfies Meta<typeof CopyButton>;

export default meta;

type Story = StoryObj<typeof CopyButton>;

// ── Default appearance ────────────────────────────────────────────────────────

/** Default button variant — click to copy and watch the label change */
export const Default: Story = {
  args: {
    value: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    label: "Copy",
    copiedLabel: "Copied!",
    failedLabel: "Failed",
    variant: "button",
    onCopied: action("copied"),
  },
};

/** Inline / link-style variant — used within paragraphs or table cells */
export const Inline: Story = {
  args: {
    value: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    label: "Copy address",
    variant: "inline",
    onCopied: action("copied"),
  },
};

// ── Content types ─────────────────────────────────────────────────────────────

/** Copying a plain text string (default format) */
export const CopyText: Story = {
  args: {
    value: "stellar:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    label: "Copy address",
    format: "text",
    variant: "button",
  },
};

/** Copying an object serialised as JSON */
export const CopyJSON: Story = {
  args: {
    value: { bridge: "Circle", status: "healthy", tvl: 500_000_000 },
    label: "Copy JSON",
    format: "json",
    variant: "button",
    onCopied: action("copied"),
  },
};

// ── Custom labels ─────────────────────────────────────────────────────────────

export const CustomLabels: Story = {
  args: {
    value: "0xABC123",
    label: "Copy hash",
    copiedLabel: "Hash copied ✓",
    failedLabel: "Copy failed ✗",
    variant: "button",
  },
};

// ── Accessibility ─────────────────────────────────────────────────────────────

/** Custom aria-label for screen readers when the visible text is too generic */
export const WithAriaLabel: Story = {
  args: {
    value: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    label: "Copy",
    ariaLabel: "Copy Stellar account address to clipboard",
    variant: "button",
  },
};

// ── Composition example ───────────────────────────────────────────────────────

/** Shows the button inside a data row — a common real-world context */
export const InsideDataRow: Story = {
  render: () => {
    const address = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
    return (
      <div className="flex items-center gap-3 rounded-lg border border-stellar-border bg-stellar-card px-4 py-3">
        <span className="font-mono text-sm text-stellar-text-primary truncate max-w-xs">
          {address}
        </span>
        <CopyButton
          value={address}
          label="Copy"
          copiedLabel="Copied!"
          ariaLabel="Copy Stellar address"
          variant="button"
          onCopied={action("copied")}
        />
      </div>
    );
  },
};

/** Inline copy button next to a transaction hash */
export const NextToHash: Story = {
  render: () => {
    const txHash = "a1b2c3d4e5f6...7890abcdef";
    return (
      <p className="text-sm text-stellar-text-secondary">
        Transaction{" "}
        <span className="font-mono text-stellar-text-primary">{txHash}</span>
        {" "}
        <CopyButton
          value={txHash}
          label="copy"
          variant="inline"
          ariaLabel="Copy transaction hash"
          onCopied={action("copied")}
        />
      </p>
    );
  },
};
