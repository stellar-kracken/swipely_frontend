import type { Meta, StoryObj, Decorator } from "@storybook/react";
import { WebSocketContext } from "../contexts/WebSocketContextValue";
import type { WebSocketContextValue } from "../contexts/WebSocketContextValue";
import type { ConnectionState } from "../types";
import ConnectionStatus from "./ConnectionStatus";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wraps the story in a mock WebSocketContext so the component can render
 * without a live WebSocket server.
 */
function withWebSocketContext(
  connectionState: ConnectionState,
  isPollingFallback = false
): Decorator {
  const value: WebSocketContextValue = {
    connectionState,
    isPollingFallback,
    send: () => {},
    subscribe: () => () => {},
  };

  return (Story) => (
    <WebSocketContext.Provider value={value}>
      <Story />
    </WebSocketContext.Provider>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────
//
// Theme gap: preview.tsx hardcodes `className="dark"` — there is no light/dark
// toggle in this Storybook setup. These stories only render in dark mode.
// To add theme switching, install @storybook/addon-themes and add a
// `withThemeByClassName` decorator to preview.tsx.
//
// Prop-documentation gap:
//   - ConnectionStatus has NO props at all. Its entire state (connectionState,
//     isPollingFallback) is read from WebSocketContext via useWebSocketContext().
//     This makes the component impossible to test or preview in isolation
//     without mocking the context, which is what the withWebSocketContext
//     decorator below does. A future improvement would be to accept optional
//     override props for testing/Storybook scenarios.

const meta = {
  title: "Swipely/Network/ConnectionStatus",
  component: ConnectionStatus,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ConnectionStatus>;

export default meta;

type Story = StoryObj<typeof ConnectionStatus>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** WebSocket is open and streaming live data */
export const Connected: Story = {
  decorators: [withWebSocketContext("connected")],
};

/** WebSocket is in the process of establishing a connection */
export const Connecting: Story = {
  decorators: [withWebSocketContext("connecting")],
};

/** WebSocket is closed — no active connection */
export const Disconnected: Story = {
  decorators: [withWebSocketContext("disconnected")],
};

/** WebSocket encountered an error and cannot connect */
export const Error: Story = {
  decorators: [withWebSocketContext("error")],
};

/**
 * Polling fallback mode — WebSocket is unavailable so the client falls
 * back to HTTP polling.  The label changes from "Live" to "Polling".
 */
export const PollingFallback: Story = {
  decorators: [withWebSocketContext("connected", true)],
};
