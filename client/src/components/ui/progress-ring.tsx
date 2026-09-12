import { useId } from "react";
import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  size = 140,
  strokeWidth = 10,
  className,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const id = useId();
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-400)" />
            <stop offset="100%" stopColor="var(--accent-600)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
