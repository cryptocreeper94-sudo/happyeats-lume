import { useAuth } from "@/lib/auth-context";
import { Redirect } from "wouter";

type Role = "owner" | "developer";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/team" />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user?.role as Role)) {
      return <Redirect to="/team" />;
    }
  }

  return <>{children}</>;
}
