type MessageHandler = (data: unknown) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string): void {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const channel = data.channel || data.type;
        const handlers = this.listeners.get(channel);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }
      } catch {
        console.error("Failed to parse WebSocket message");
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.attemptReconnect(url);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max WebSocket reconnection attempts reached");
      return;
    }
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    setTimeout(() => this.connect(url), delay);
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(handler);

    // Send subscription message to server
    this.send({ type: "subscribe", channel });

    return () => {
      this.listeners.get(channel)?.delete(handler);
      if (this.listeners.get(channel)?.size === 0) {
        this.listeners.delete(channel);
        this.send({ type: "unsubscribe", channel });
      }
    };
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.listeners.clear();
  }
}

export const wsService = new WebSocketService();
