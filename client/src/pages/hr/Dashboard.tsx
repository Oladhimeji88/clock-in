import { useEffect, useState } from "react";
import { Users, CheckCircle2, Coffee, PlaneTakeoff } from "lucide-react";
import { api, type Employee } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await api.get<Employee[]>("/employees");
      if (mounted) {
        setEmployees(data);
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const working = employees.filter((e) => e.status === "working").length;
  const onBreak = employees.filter((e) => e.status === "on_break").length;
  const onLeave = employees.filter((e) => e.status === "on_leave").length;

  return (
    <div className="animate-fade-in p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-slate-400">Live snapshot of your workforce today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Employees" value={String(employees.length)} icon={Users} tone="brand" />
        <StatCard label="Currently Working" value={String(working)} icon={CheckCircle2} tone="success" />
        <StatCard label="On Break" value={String(onBreak)} icon={Coffee} tone="warning" />
        <StatCard label="On Leave" value={String(onLeave)} icon={PlaneTakeoff} tone="info" />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Live status</CardTitle>
            <CardDescription>Updates automatically every 15 seconds.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
          ) : employees.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No employees yet. Add your first employee to get started.</p>
          ) : (
            <div className="divide-y divide-surface-border">
              {employees.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.name} size={34} />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-400 font-mono">{e.workedHoursToday.toFixed(1)}h / {e.targetHours}h</p>
                    <StatusBadge status={e.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
