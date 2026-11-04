import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEstimation, requestEstimation } from "../services/estimation";

export function useEstimation(projectId: string | undefined) {
  return useQuery({
    queryKey: ["projects", projectId, "estimation"],
    queryFn: () => getEstimation(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useRequestEstimation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestEstimation(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "estimation"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "activity"],
      });
    },
  });
}
