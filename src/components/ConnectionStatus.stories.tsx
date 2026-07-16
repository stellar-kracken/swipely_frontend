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
