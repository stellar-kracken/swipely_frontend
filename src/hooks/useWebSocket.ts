import { useEffect, useRef, useCallback } from "react";
import { wsService } from "../services/websocket";

const WS_URL = `ws://${window.location.hostname}:3002/api/v1/ws`;

export function useWebSocket(channel: string, onMessage: (data: unknown) => void) {
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!connectedRef.current) {
      wsService.connect(WS_URL);
      connectedRef.current = true;
    }

    const unsubscribe = wsService.subscribe(channel, onMessage);

    return () => {
      unsubscribe();
    };
  }, [channel, onMessage]);

  const send = useCallback((data: unknown) => {
    wsService.send(data);
  }, []);

  return { send };
}
