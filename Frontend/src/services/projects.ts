import type { Project, ProjectCreatePayload, ProjectPatchPayload } from "../types";
import { unwrapList } from "../utils/format";
import { apiFetch } from "./api";

export async function listProjects(): Promise<Project[]> {
  const data = await apiFetch<unknown>("/api/projects");
  return unwrapList<Project>(data);
}

export function createProject(payload: ProjectCreatePayload): Promise<Project> {
  return apiFetch<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProject(projectId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${projectId}`);
}

export function patchProject(
  projectId: string,
  payload: ProjectPatchPayload,
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
