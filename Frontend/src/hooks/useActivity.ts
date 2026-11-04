import { useQuery } from "@tanstack/react-query";
import { listProjectActivity } from "../services/activity";

export function useProjectActivity(projectId: string | undefined) {
  return useQuery({
    queryKey: ["projects", projectId, "activity"],
    queryFn: () => listProjectActivity(projectId!),
    enabled: Boolean(projectId),
  });
}
