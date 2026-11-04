import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, register } from "../services/auth";
import type { LoginPayload, RegisterPayload, User } from "../types";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../utils/authStorage";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (payload: LoginPayload) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function hasAccessToken(value: unknown): value is { access_token: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "access_token" in value &&
      typeof (value as { access_token: unknown }).access_token === "string",
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
  });

  const persistToken = useCallback((next: string) => {
    setAccessToken(next);
    setToken(next);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      persistToken(data.access_token);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const loginUser = useCallback(
    async (payload: LoginPayload) => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation],
  );

  const registerUser = useCallback(
    async (payload: RegisterPayload) => {
      const result = await register(payload);
      if (hasAccessToken(result)) {
        persistToken(result.access_token);
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        return;
      }
      await loginUser({ email: payload.email, password: payload.password });
    },
    [loginUser, persistToken, queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      token,
      isLoading: Boolean(token) && meQuery.isLoading,
      isAuthenticated: Boolean(token && meQuery.data),
      loginUser,
      registerUser,
      logout,
    }),
    [loginUser, logout, meQuery.data, meQuery.isLoading, registerUser, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
