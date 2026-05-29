import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TimeRangeProvider } from "./hooks/useTimeRange";
import { WatchlistProvider } from "./hooks/useWatchlist";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import ThemeProvider from "./theme/ThemeProvider";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WebSocketProvider>
            <WatchlistProvider>
              <TimeRangeProvider>
                <App />
              </TimeRangeProvider>
            </WatchlistProvider>
          </WebSocketProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
