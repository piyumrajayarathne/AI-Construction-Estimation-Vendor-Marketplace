import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PageSpinner } from "./LoadingState";

export function ProtectedRoute() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (token && isLoading) {
    return <PageSpinner label="Checking your session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { token, isAuthenticated, isLoading } = useAuth();

  if (token && isLoading) {
    return <PageSpinner label="Checking your session" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}


