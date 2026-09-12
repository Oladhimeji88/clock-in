import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Clock3, LayoutDashboard, Users, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/hr", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/hr/employees", label: "Employees", icon: Users, end: false },
];

export default function HrLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface-0">
      <aside className="flex w-64 shrink-0 flex-col border-r border-surface-border bg-surface-1 p-4">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-brand-400 to-brand-700">
            <Clock3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">ChronoTrack</p>
            <p className="text-[11px] text-slate-500 leading-tight">HR Console</p>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-3 text-white"
                    : "text-slate-400 hover:bg-surface-2 hover:text-slate-200"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-surface-border pt-4">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <Avatar name={user?.name ?? "HR"} size={32} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-danger-500/10 hover:text-danger-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
