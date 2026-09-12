import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/api";

type Tone = "brand" | "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-accent-500/15 text-accent-400 ring-1 ring-inset ring-accent-500/30",
  success: "bg-success-500/15 text-success-400 ring-1 ring-inset ring-success-500/30",
  warning: "bg-warning-500/15 text-warning-400 ring-1 ring-inset ring-warning-500/30",
  danger: "bg-danger-500/15 text-danger-400 ring-1 ring-inset ring-danger-500/30",
  info: "bg-info-500/15 text-info-400 ring-1 ring-inset ring-info-500/30",
  neutral: "bg-surface-3 text-slate-300 ring-1 ring-inset ring-surface-border",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

const statusConfig: Record<AttendanceStatus, { label: string; tone: Tone }> = {
  working: { label: "Working", tone: "success" },
  on_break: { label: "On Break", tone: "warning" },
  on_leave: { label: "On Leave", tone: "info" },
  clocked_out: { label: "Clocked Out", tone: "neutral" },
};

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, tone } = statusConfig[status];
  return (
    <Badge tone={tone}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "working" && "bg-success-400 animate-pulse-slow",
          status === "on_break" && "bg-warning-400",
          status === "on_leave" && "bg-info-400",
          status === "clocked_out" && "bg-slate-500"
        )}
      />
      {label}
    </Badge>
  );
}
