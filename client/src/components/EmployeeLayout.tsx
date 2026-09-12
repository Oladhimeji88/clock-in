import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Clock3, Timer, Maximize2, Settings, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app", label: "My Clock", icon: Timer, end: true },
  { to: "/app/fullscreen", label: "Full Screen", icon: Maximize2, end: false },
  { to: "/app/settings", label: "Customize", icon: Settings, end: false },
];

export default function EmployeeLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.accent = user?.clockStyle.accent ?? "indigo";
  }, [user?.clockStyle.accent]);

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-1/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-accent-400 to-accent-600">
              <Clock3 className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-bold text-white">ChronoTrack</p>
          </div>

          <nav className="flex items-center gap-1 rounded-xl bg-surface-2 p-1 border border-surface-border">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                    isActive ? "bg-surface-3 text-white" : "text-slate-400 hover:text-slate-200"
                  )
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{user?.email}</p>
            </div>
            <Avatar name={user?.name ?? "U"} size={32} />
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-danger-500/10 hover:text-danger-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
