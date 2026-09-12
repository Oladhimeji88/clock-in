import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock3, Lock, Mail, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate(data.user.role === "hr" ? "/hr" : "/app", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-0 px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-400 to-brand-700 shadow-glow-brand">
            <Clock3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">ChronoTrack</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your workspace</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-surface-border bg-surface-2 p-6 shadow-card"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-danger-500/10 px-3 py-2 text-xs text-danger-400 border border-danger-500/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Employee accounts are created by your HR administrator.
        </p>
      </motion.div>
    </div>
  );
}
