import type { ActivityEvent } from "../types";
import { unwrapList } from "../utils/format";
import { apiFetch } from "./api";

export async function listProjectActivity(
  projectId: string,
): Promise<ActivityEvent[]> {
  const data = await apiFetch<unknown>(`/api/projects/${projectId}/activity`);
  return unwrapList<ActivityEvent>(data);
}
