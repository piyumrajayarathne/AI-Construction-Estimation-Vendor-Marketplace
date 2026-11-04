import { useQuery } from "@tanstack/react-query";
import { getAiStatus } from "../services/ai";

export function useAiStatus() {
  return useQuery({
    queryKey: ["ai", "status"],
    queryFn: getAiStatus,
    retry: false,
  });
}
