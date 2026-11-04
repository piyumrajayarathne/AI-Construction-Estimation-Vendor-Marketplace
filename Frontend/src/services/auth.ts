import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
} from "../types";
import { apiFetch } from "./api";

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload): Promise<unknown> {
  return apiFetch<unknown>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}
