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
  const loggedSet = ((...args: unknown[]) => {
    const prevState = get();
    (set as (...innerArgs: unknown[]) => void)(...args);
    const nextState = get();

    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.group(`[Zustand] ${name || "Store"} - ${args[2] ?? "action"}`);
      console.log("Previous state:", prevState);
      console.log("Next state:", nextState);
      console.groupEnd();
    }

    return nextState;
  }) as typeof set;

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
    const wrappedSet = ((...args: unknown[]) => {
      const start = performance.now();
      const actionName = typeof args[2] === "string" ? args[2] : "unknown";

      const result = (set as (...innerArgs: unknown[]) => void)(...args);

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

      return result;
    }) as typeof set;

    return f(wrappedSet, get, store);
  };
};

// Error boundary middleware
export const errorBoundaryMiddleware = <T>(
  f: StateCreator<T, [], []>,
  onError?: (error: Error, actionName: string) => void
): StateCreator<T, [], []> => {
  return (set, get, store) => {
    const wrappedSet = ((...args: unknown[]) => {
      try {
        return (set as (...innerArgs: unknown[]) => void)(...args);
      } catch (error) {
        const actionName = typeof args[2] === "string" ? args[2] : "unknown";

        if (onError && error instanceof Error) {
          onError(error, actionName);
        } else {
          console.error(`[Zustand Error] Action "${actionName}" failed:`, error);
        }

        throw error;
      }
    }) as typeof set;

    return f(wrappedSet, get, store);
  };
};
