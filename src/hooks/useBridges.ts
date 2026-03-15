import { useQuery } from "@tanstack/react-query";
import { getBridges, getBridgeStats } from "../services/api";

export function useBridges() {
  return useQuery({
    queryKey: ["bridges"],
    queryFn: getBridges,
  });
}

export function useBridgeStats(bridgeName: string) {
  return useQuery({
    queryKey: ["bridge-stats", bridgeName],
    queryFn: () => getBridgeStats(bridgeName),
    enabled: !!bridgeName,
  });
}
