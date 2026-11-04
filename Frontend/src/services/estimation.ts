import type { EstimationResult } from "../types";
import { apiFetch } from "./api";

export function getEstimation(projectId: string): Promise<EstimationResult> {
  return apiFetch<EstimationResult>(`/api/projects/${projectId}/estimation`);
}

export function requestEstimation(
  projectId: string,
): Promise<EstimationResult> {
  return apiFetch<EstimationResult>(`/api/projects/${projectId}/estimation`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
