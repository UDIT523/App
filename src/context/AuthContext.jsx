import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { loginUser, registerUser } from "../services/usersService";

const AuthContext = createContext(null);
const STORAGE_KEY = "sparepro.currentUser";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Session without authentication: the "current user" is a row from the
 * public.users table, persisted in localStorage. Access control is removed —
 * can() always returns true (roles are kept only as labels).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const persist = useCallback((u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (username, password) => {
      const u = await loginUser(username, password);
      persist(u);
      return u;
    },
    [persist]
  );

const register = useCallback(
  async (values) => {
    return await registerUser(values);
  },
  []
);

  const logout = useCallback(() => persist(null), [persist]);

  // No authentication → everyone can do everything.
  const can = useCallback(() => true, []);

  const value = useMemo(
    () => ({
      user,
      profile: user,
      role: user?.role || null,
      loading: false,
      isAuthenticated: Boolean(user),
      configured: isSupabaseConfigured,
      can,
      login,
      register,
      logout,
    }),
    [user, can, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
