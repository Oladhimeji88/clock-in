import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockFace } from "@/components/clock-faces/ClockFace";
import { cn } from "@/lib/utils";
import { api, type ClockStyle } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const faces: { value: ClockStyle["face"]; label: string }[] = [
  { value: "digital", label: "Digital" },
  { value: "analog", label: "Analog" },
  { value: "minimal", label: "Minimal" },
  { value: "flip", label: "Flip Board" },
  { value: "neon", label: "Neon" },
];

const accents: { value: ClockStyle["accent"]; hex: string }[] = [
  { value: "indigo", hex: "#6366f1" },
  { value: "emerald", hex: "#10b981" },
  { value: "rose", hex: "#f43f5e" },
  { value: "amber", hex: "#f59e0b" },
  { value: "sky", hex: "#0ea5e9" },
  { value: "violet", hex: "#8b5cf6" },
];

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [style, setStyle] = useState<ClockStyle>(
    user?.clockStyle ?? { face: "digital", accent: "indigo", theme: "dark" }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.accent = style.accent;
    return () => {
      document.documentElement.dataset.accent = user?.clockStyle.accent ?? "indigo";
    };
  }, [style.accent]);

  async function save() {
    setSaving(true);
    try {
      await api.put("/attendance/clock-style", style);
      updateUser({ clockStyle: style });
      toast.success("Clock style saved");
    } catch {
      toast.error("Could not save your preferences");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customize Your Clock</h1>
        <p className="mt-1 text-sm text-slate-400">Personalize how your clock looks. Only you will see this.</p>
      </div>

      <Card className="flex items-center justify-center p-10">
        <ClockFace face={style.face} size="md" />
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Clock style</CardTitle>
            <CardDescription>Choose the face style for your clock display.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {faces.map((f) => (
              <button
                key={f.value}
                onClick={() => setStyle((s) => ({ ...s, face: f.value }))}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                  style.face === f.value
                    ? "border-accent-500 bg-accent-500/10 text-accent-400"
                    : "border-surface-border bg-surface-1 text-slate-300 hover:bg-surface-3"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Accent color</CardTitle>
            <CardDescription>Sets the highlight color across your dashboard.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {accents.map((a) => (
              <button
                key={a.value}
                onClick={() => setStyle((s) => ({ ...s, accent: a.value }))}
                style={{ backgroundColor: a.hex }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface-2 transition-transform hover:scale-105"
                title={a.value}
              >
                {style.accent === a.value && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={save} loading={saving}>
          Save preferences
        </Button>
      </div>
    </div>
  );
}
