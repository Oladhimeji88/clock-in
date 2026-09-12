import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import HrLayout from "@/components/HrLayout";
import EmployeeLayout from "@/components/EmployeeLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/hr/Dashboard";
import Employees from "@/pages/hr/Employees";
import ClockIn from "@/pages/employee/ClockIn";
import FullscreenClock from "@/pages/employee/FullscreenClock";
import Settings from "@/pages/employee/Settings";

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "hr" ? "/hr" : "/app"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-right" richColors />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute role="hr" />}>
          <Route path="/hr" element={<HrLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="employee" />}>
          <Route path="/app" element={<EmployeeLayout />}>
            <Route index element={<ClockIn />} />
            <Route path="fullscreen" element={<FullscreenClock />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
