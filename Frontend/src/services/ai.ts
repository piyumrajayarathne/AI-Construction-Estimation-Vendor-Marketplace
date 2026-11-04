import type { AiStatus } from "../types";
import { apiFetch } from "./api";

export function getAiStatus(): Promise<AiStatus> {
  return apiFetch<AiStatus>("/api/ai/status");
}
