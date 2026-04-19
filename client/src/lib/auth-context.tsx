import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: number;
  name: string;
  slug: string;
  ownerName: string;
  pin: string;
  role: "owner" | "developer";
  needsPasswordSetup?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.role) {
          parsed.role = parsed.role || "owner";
        }
        const expiresAt = localStorage.getItem("authUser_expiresAt");
        if (expiresAt && Date.now() > parseInt(expiresAt)) {
          localStorage.removeItem("authUser");
          localStorage.removeItem("authUser_expiresAt");
          sessionStorage.removeItem("authUser");
          return null;
        }
        localStorage.setItem("authUser", JSON.stringify(parsed));
        sessionStorage.removeItem("authUser");
        if (!expiresAt) {
          localStorage.setItem("authUser_expiresAt", String(Date.now() + SESSION_DURATION_MS));
        }
        return parsed;
      } catch {
        localStorage.removeItem("authUser");
        localStorage.removeItem("authUser_expiresAt");
        sessionStorage.removeItem("authUser");
        return null;
      }
    }
    return null;
  });

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("authUser_expiresAt", String(Date.now() + SESSION_DURATION_MS));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authUser_expiresAt");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
