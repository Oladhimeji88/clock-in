import { Coffee, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatusBadge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/api";

export function HourCountPanel({
  status,
  workedSeconds,
  breakSeconds,
  targetHours,
}: {
  status: AttendanceStatus;
  workedSeconds: number;
  breakSeconds: number;
  targetHours: number;
}) {
  const targetSeconds = targetHours * 3600;
  const progress = targetSeconds > 0 ? workedSeconds / targetSeconds : 0;
  const hoursDecimal = (workedSeconds / 3600).toFixed(1);
  const pct = Math.min(100, Math.round(progress * 100));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Today's Hours</p>
        <StatusBadge status={status} />
      </div>

      <div className="mt-5 flex items-center justify-center">
        <ProgressRing value={progress} size={168} strokeWidth={12}>
          <div className="text-center">
            <p className="font-mono text-3xl font-bold tabular-nums text-white">{formatDuration(workedSeconds)}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-400">{hoursDecimal}h logged</p>
          </div>
        </ProgressRing>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-surface-1 px-3 py-2.5 border border-surface-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500/15">
            <Target className="h-3.5 w-3.5 text-accent-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 leading-tight">Target</p>
            <p className="text-sm font-semibold text-slate-200 leading-tight">{targetHours}h ({pct}%)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-surface-1 px-3 py-2.5 border border-surface-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-500/15">
            <Coffee className="h-3.5 w-3.5 text-warning-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 leading-tight">Break</p>
            <p className="text-sm font-semibold text-slate-200 leading-tight">{formatDuration(breakSeconds)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
