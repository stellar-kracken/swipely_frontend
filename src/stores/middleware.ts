import type { StateCreator, StoreMutatorIdentifier } from "zustand";

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (nextStateOrUpdater: any, replace?: boolean, action?: string) => {
    const prevState = get();
    (set as any)(nextStateOrUpdater, replace, action);
    const nextState = get();

    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.group(`[Zustand] ${name || "Store"} - ${action || "action"}`);
      console.log("Previous state:", prevState);
      console.log("Next state:", nextState);
      console.groupEnd();
    }
  };

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as Logger;

// Middleware to track state changes for analytics/metrics
export interface StateChangeMetric {
  storeName: string;
  actionName: string;
  timestamp: number;
  duration: number;
}

export const stateMetricsMiddleware = <T>(
  f: StateCreator<T, [], []>,
  storeName: string,
  onMetric?: (metric: StateChangeMetric) => void
): StateCreator<T, [], []> => {
  return (set, get, store) => {
    const wrappedSet: typeof set = (nextStateOrUpdater: any, replace?: boolean, action?: string) => {
      const start = performance.now();
      const actionName = typeof action === "string" ? action : "unknown";

      (set as any)(nextStateOrUpdater, replace, action);

      const duration = performance.now() - start;
      const metric: StateChangeMetric = {
        storeName,
        actionName,
        timestamp: Date.now(),
        duration,
      };

      if (onMetric) {
        onMetric(metric);
      }
    };

    return f(wrappedSet, get, store);
  };
};

// Error boundary middleware
export const errorBoundaryMiddleware = <T>(
  f: StateCreator<T, [], []>,
  onError?: (error: Error, actionName: string) => void
): StateCreator<T, [], []> => {
  return (set, get, store) => {
    const wrappedSet: typeof set = (nextStateOrUpdater: any, replace?: boolean, action?: string) => {
      try {
        return (set as any)(nextStateOrUpdater, replace, action);
      } catch (error) {
        const actionName = typeof action === "string" ? action : "unknown";

        if (onError && error instanceof Error) {
          onError(error, actionName);
        } else {
          console.error(`[Zustand Error] Action "${actionName}" failed:`, error);
        }

        throw error;
      }
    };

    return f(wrappedSet, get, store);
  };
};
