import type { LucideIcon } from "lucide-react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "info";
  hint?: string;
}) {
  const toneClass = {
    brand: "bg-accent-500/15 text-accent-400",
    success: "bg-success-500/15 text-success-400",
    warning: "bg-warning-500/15 text-warning-400",
    info: "bg-info-500/15 text-info-400",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-white tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
