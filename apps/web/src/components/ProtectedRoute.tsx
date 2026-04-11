import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div
        data-testid="protected-route-loading"
        className="flex min-h-screen items-center justify-center text-slate-500"
      >
        Loading…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate to="/signin" replace data-testid="protected-route-redirect" />
    );
  }

  return <Outlet />;
}
