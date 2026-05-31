import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { api } from "../services/api";
import { User } from "../types/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("copa-ga-token"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("copa-ga-user");
    return stored ? (JSON.parse(stored) as User) : null;
  });

  async function login(username: string, password: string) {
    const response = await api.login(username, password);
    localStorage.setItem("copa-ga-token", response.token);
    localStorage.setItem("copa-ga-user", JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem("copa-ga-token");
    localStorage.removeItem("copa-ga-user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
