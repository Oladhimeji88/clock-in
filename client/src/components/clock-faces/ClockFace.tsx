import { useEffect, useState } from "react";
import type { ClockStyle } from "@/lib/api";
import { cn } from "@/lib/utils";

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ClockFace({ face, size = "md" }: { face: ClockStyle["face"]; size?: "sm" | "md" | "lg" }) {
  const now = useNow();
  switch (face) {
    case "analog":
      return <AnalogFace now={now} size={size} />;
    case "minimal":
      return <MinimalFace now={now} size={size} />;
    case "flip":
      return <FlipFace now={now} size={size} />;
    case "neon":
      return <NeonFace now={now} size={size} />;
    default:
      return <DigitalFace now={now} size={size} />;
  }
}

const digitSizes = { sm: "text-3xl", md: "text-5xl", lg: "text-7xl md:text-8xl" };
const dateSizes = { sm: "text-[11px]", md: "text-sm", lg: "text-base" };

function DigitalFace({ now, size }: { now: Date; size: "sm" | "md" | "lg" }) {
  return (
    <div className="text-center">
      <div className={cn("font-mono font-bold tabular-nums text-white tracking-tight", digitSizes[size])}>
        {pad(now.getHours())}
        <span className="text-accent-400">:</span>
        {pad(now.getMinutes())}
        <span className="text-accent-400">:</span>
        {pad(now.getSeconds())}
      </div>
      <div className={cn("mt-2 text-slate-400 font-medium", dateSizes[size])}>
        {now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function MinimalFace({ now, size }: { now: Date; size: "sm" | "md" | "lg" }) {
  return (
    <div className="text-center">
      <div className={cn("font-sans font-light tabular-nums text-slate-100 tracking-tight", digitSizes[size])}>
        {pad(now.getHours())}:{pad(now.getMinutes())}
        <span className="text-slate-500">:{pad(now.getSeconds())}</span>
      </div>
      <div className={cn("mt-2 text-slate-500", dateSizes[size])}>
        {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}

function NeonFace({ now, size }: { now: Date; size: "sm" | "md" | "lg" }) {
  return (
    <div className="text-center">
      <div
        className={cn("font-mono font-bold tabular-nums tracking-tight text-accent-400", digitSizes[size])}
        style={{
          textShadow:
            "0 0 8px var(--accent-400), 0 0 24px var(--accent-500), 0 0 48px var(--accent-600)",
        }}
      >
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </div>
      <div className={cn("mt-2 text-accent-400/70", dateSizes[size])}>
        {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function FlipDigit({ value, size }: { value: string; size: "sm" | "md" | "lg" }) {
  const boxSize = { sm: "h-9 w-7 text-xl", md: "h-14 w-11 text-3xl", lg: "h-20 w-16 text-5xl" }[size];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-md bg-surface-3 font-mono font-bold text-white shadow-[0_2px_0_0_rgba(0,0,0,0.4)_inset] border border-surface-border",
        boxSize
      )}
    >
      {value}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-black/40" />
    </div>
  );
}

function FlipFace({ now, size }: { now: Date; size: "sm" | "md" | "lg" }) {
  const parts = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())];
  const gap = { sm: "gap-1", md: "gap-1.5", lg: "gap-2" }[size];
  return (
    <div className="text-center">
      <div className={cn("flex items-center justify-center", gap)}>
        {parts.map((part, i) => (
          <div key={i} className={cn("flex", gap)}>
            {part.split("").map((d, j) => (
              <FlipDigit key={j} value={d} size={size} />
            ))}
            {i < 2 && <span className="mx-0.5 self-center font-bold text-slate-500">:</span>}
          </div>
        ))}
      </div>
      <div className={cn("mt-3 text-slate-500", dateSizes[size])}>
        {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function AnalogFace({ now, size }: { now: Date; size: "sm" | "md" | "lg" }) {
  const px = { sm: 96, md: 160, lg: 260 }[size];
  const s = now.getSeconds();
  const m = now.getMinutes();
  const h = now.getHours() % 12;

  const secDeg = s * 6;
  const minDeg = m * 6 + s * 0.1;
  const hourDeg = h * 30 + m * 0.5;

  const center = px / 2;

  return (
    <div className="text-center">
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`}>
        <circle cx={center} cy={center} r={center - 3} fill="var(--color-surface-2)" stroke="var(--color-surface-border)" strokeWidth="2" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const r1 = center - 10;
          const r2 = center - 16;
          return (
            <line
              key={i}
              x1={center + r1 * Math.sin(angle)}
              y1={center - r1 * Math.cos(angle)}
              x2={center + r2 * Math.sin(angle)}
              y2={center - r2 * Math.cos(angle)}
              stroke="var(--color-surface-border)"
              strokeWidth={2}
            />
          );
        })}
        <line
          x1={center}
          y1={center}
          x2={center + center * 0.45 * Math.sin((hourDeg * Math.PI) / 180)}
          y2={center - center * 0.45 * Math.cos((hourDeg * Math.PI) / 180)}
          stroke="white"
          strokeWidth={px * 0.025}
          strokeLinecap="round"
        />
        <line
          x1={center}
          y1={center}
          x2={center + center * 0.65 * Math.sin((minDeg * Math.PI) / 180)}
          y2={center - center * 0.65 * Math.cos((minDeg * Math.PI) / 180)}
          stroke="white"
          strokeWidth={px * 0.018}
          strokeLinecap="round"
        />
        <line
          x1={center}
          y1={center}
          x2={center + center * 0.75 * Math.sin((secDeg * Math.PI) / 180)}
          y2={center - center * 0.75 * Math.cos((secDeg * Math.PI) / 180)}
          stroke="var(--accent-500)"
          strokeWidth={px * 0.01}
          strokeLinecap="round"
        />
        <circle cx={center} cy={center} r={px * 0.025} fill="var(--accent-500)" />
      </svg>
      <div className={cn("mt-2 text-slate-400", dateSizes[size])}>
        {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}
