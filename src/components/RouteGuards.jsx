import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./ui/Spinner";

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-ink-25">
      <Spinner label="Loading…" />
    </div>
  );
}

/** Requires an authenticated session; otherwise redirects to /login. */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

/** Requires a specific capability; otherwise bounces to the dashboard. */
export function RoleRoute({ perm, children }) {
  const { can, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!can(perm)) return <Navigate to="/" replace />;
  return children;
}

/** For /login and /register — redirects authenticated users to the app. */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
