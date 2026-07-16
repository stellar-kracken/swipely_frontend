import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Returns the most recent TanStack Query `dataUpdatedAt` across the cache.
 * Subscribes to cache changes so the value stays current without polling.
 */
export function useLatestQueryUpdatedAt(): number | null {
  const queryClient = useQueryClient();
  const [updatedAt, setUpdatedAt] = useState<number | null>(() =>
    maxDataUpdatedAt(queryClient.getQueryCache().getAll()),
  );

  useEffect(() => {
    const cache = queryClient.getQueryCache();

    const sync = () => {
      const next = maxDataUpdatedAt(cache.getAll());
      setUpdatedAt((prev) => (prev === next ? prev : next));
    };

    sync();
    return cache.subscribe(sync);
  }, [queryClient]);

  return updatedAt;
}

function maxDataUpdatedAt(
  queries: Array<{ state: { dataUpdatedAt: number } }>,
): number | null {
  let max = 0;
  for (const query of queries) {
    if (query.state.dataUpdatedAt > max) {
      max = query.state.dataUpdatedAt;
    }
  }
  return max > 0 ? max : null;
}
