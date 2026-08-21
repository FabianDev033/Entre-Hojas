import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type CurrentUser = {
  id: number;
  user: string;
};

type LoginCredentials = {
  user: string;
  password: string;
};

type AuthContextType = {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const response = await axios.get<{ user: CurrentUser }>(
        `${API_BASE_URL}/api/auth/me`,
        { withCredentials: true },
      );
      setCurrentUser(response.data.user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async ({ user, password }: LoginCredentials) => {
    const response = await axios.post<{ user: CurrentUser }>(
      `${API_BASE_URL}/api/auth/login`,
      { user, password },
      { withCredentials: true },
    );
    setCurrentUser(response.data.user);
  }, []);

  const logout = useCallback(async () => {
    await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    setCurrentUser(null);
  }, []);

  const value = useMemo(() => ({ currentUser, isLoading, login, logout }), [currentUser, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
