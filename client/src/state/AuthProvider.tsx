import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { authApi } from "../lib/api";
import { authStorage } from "../lib/authStorage";
import type { AuthResponse, PublicUser } from "../types";

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  isReady: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

interface Credentials {
  username: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const handleAuthSuccess = (setters: {
  setToken: (token: string | null) => void;
  setUser: (user: PublicUser | null) => void;
}) =>
  ({ token, user }: AuthResponse) => {
    authStorage.setToken(token);
    setters.setToken(token);
    setters.setUser(user);
  };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    const storedToken = authStorage.getToken();
    if (!storedToken) {
      setReady(true);
      return;
    }
    authApi
      .me()
      .then((me) => {
        setUser(me);
        setToken(storedToken);
      })
      .catch(() => {
        authStorage.clear();
        setUser(null);
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const response = await authApi.login(credentials);
    handleAuthSuccess({ setToken, setUser })(response);
  }, []);

  const register = useCallback(async (credentials: Credentials) => {
    const response = await authApi.register(credentials);
    handleAuthSuccess({ setToken, setUser })(response);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isReady, login, register, logout }),
    [isReady, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
