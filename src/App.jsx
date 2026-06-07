import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import {
  ProtectedRoute,
  RoleRoute,
  PublicOnlyRoute,
} from "./components/RouteGuards";
import SetupRequired from "./components/SetupRequired";
import AppShell from "./components/layout/AppShell";
import Spinner from "./components/ui/Spinner";

// Eager — first paint / unauthenticated.
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Lazy — heavy authenticated pages (recharts, xlsx) split into their own chunks.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const IssuePart = lazy(() => import("./pages/IssuePart"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Users = lazy(() => import("./pages/Users"));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  );
}

export default function App() {
  const { configured } = useAuth();

  if (!configured) return <SetupRequired />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="inventory"
          element={
            <Suspense fallback={<PageFallback />}>
              <Inventory />
            </Suspense>
          }
        />
        <Route
          path="issue"
          element={
            <Suspense fallback={<PageFallback />}>
              <IssuePart />
            </Suspense>
          }
        />
        <Route
          path="transactions"
          element={
            <Suspense fallback={<PageFallback />}>
              <Transactions />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <RoleRoute perm="users:manage">
              <Suspense fallback={<PageFallback />}>
                <Users />
              </Suspense>
            </RoleRoute>
          }
        />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
