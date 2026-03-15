import { useQuery } from "@tanstack/react-query";
import { getAssets } from "../services/api";

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });
}
