import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  getProject,
  listProjects,
  patchProject,
} from "../services/projects";
import type { ProjectCreatePayload, ProjectPatchPayload } from "../types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectCreatePayload) => createProject(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function usePatchProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPatchPayload) =>
      patchProject(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "activity"],
      });
    },
  });
}
