import { useQuery } from "@tanstack/react-query";
import { getAssetPrice } from "../services/api";

export function usePrices(symbol: string) {
  return useQuery({
    queryKey: ["prices", symbol],
    queryFn: () => getAssetPrice(symbol),
    enabled: !!symbol,
    select: (data) => ({
      ...data,
      sources: data?.sources ?? [],
      history: [], // TODO: Fetch historical price data for charting
    }),
  });
}
