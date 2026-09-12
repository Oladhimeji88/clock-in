import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";

export function ProtectedRoute({ role }: { role: "hr" | "employee" }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === "hr" ? "/hr" : "/app"} replace />;

  return <Outlet />;
}
