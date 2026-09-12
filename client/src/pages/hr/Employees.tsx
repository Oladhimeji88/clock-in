import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Download, Pencil, Trash2, Search } from "lucide-react";
import { api, type Employee } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  async function load() {
    const { data } = await api.get<Employee[]>("/employees");
    setEmployees(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function exportCsv() {
    const res = await api.get("/export/csv", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  async function removeEmployee(id: string) {
    if (!confirm("Remove this employee? This cannot be undone.")) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee removed");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not remove employee");
    }
  }

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employees</h1>
          <p className="mt-1 text-sm text-slate-400">Manage accounts, work-hour targets, and attendance exports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input placeholder="Search employees…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Today</th>
              <th className="px-5 py-3 font-medium">Target</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Loading…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No employees found.</td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="hover:bg-surface-1/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.name} size={32} />
                      <div>
                        <p className="font-medium text-slate-200">{e.name}</p>
                        <p className="text-xs text-slate-500">{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-3 font-mono text-slate-300">{e.workedHoursToday.toFixed(1)}h</td>
                  <td className="px-5 py-3 text-slate-300">{e.targetHours}h / day</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(e)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-surface-3 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeEmployee(e.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-danger-500/10 hover:text-danger-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <AddEmployeeDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
      <EditEmployeeDialog employee={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  );
}

function AddEmployeeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetHours, setTargetHours] = useState("8");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setTargetHours("8");
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/employees", { name, email, password, targetHours: Number(targetHours) });
      toast.success("Employee added");
      reset();
      onClose();
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Could not create employee");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} title="Add employee" description="Create login credentials for a new team member.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name">
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </Field>
        <Field label="Email address">
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
        </Field>
        <Field label="Temporary password">
          <Input required minLength={6} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </Field>
        <Field label="Daily target hours">
          <Input required type="number" min="0" max="24" step="0.5" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} />
        </Field>
        {error && <p className="text-xs text-danger-400">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={saving}>
          Create account
        </Button>
      </form>
    </Dialog>
  );
}

function EditEmployeeDialog({
  employee,
  onClose,
  onSaved,
}: {
  employee: Employee | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [targetHours, setTargetHours] = useState("8");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) setTargetHours(String(employee.targetHours));
    setPassword("");
  }, [employee]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    try {
      await api.put(`/employees/${employee.id}`, {
        targetHours: Number(targetHours),
        ...(password ? { password } : {}),
      });
      toast.success("Employee updated");
      onClose();
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Could not update employee");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!employee} onClose={onClose} title={employee ? `Edit ${employee.name}` : ""} description="Update work-hour target or reset password.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Daily target hours">
          <Input required type="number" min="0" max="24" step="0.5" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} />
        </Field>
        <Field label="Reset password (optional)">
          <Input type="text" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={saving}>
          Save changes
        </Button>
      </form>
    </Dialog>
  );
}
