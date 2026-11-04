import type { ApiErrorBody } from "../types";
import { clearAccessToken, getAccessToken } from "../utils/authStorage";

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function readMessageFromDetail(detail: unknown): string | null {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join("; ") : null;
  }
  if (typeof detail === "object") {
    const record = detail as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.error === "string") return record.error;
  }
  return null;
}

async function readErrorMessage(response: Response): Promise<{
  message: string;
  detail: unknown;
}> {
  const fallback = `Request failed (${response.status})`;
  try {
    const body = (await response.json()) as ApiErrorBody;
    const message =
      readMessageFromDetail(body.detail) ??
      readMessageFromDetail(body.message) ??
      readMessageFromDetail(body.error) ??
      fallback;
    return { message, detail: body };
  } catch {
    return { message: fallback, detail: null };
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });

  if (response.status === 401) {
    clearAccessToken();
  }

  if (!response.ok) {
    const { message, detail } = await readErrorMessage(response);
    throw new ApiError(message, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
