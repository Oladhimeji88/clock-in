import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { ClockFace } from "@/components/clock-faces/ClockFace";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAttendanceStatus } from "@/hooks/useAttendanceStatus";
import { formatDuration } from "@/lib/utils";

export default function FullscreenClock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { status, workedSeconds, targetHours, clockStyle } = useAttendanceStatus();

  useEffect(() => {
    if (clockStyle) document.documentElement.dataset.accent = clockStyle.accent;
  }, [clockStyle]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface-2 p-10 data-[fs=true]:min-h-screen data-[fs=true]:rounded-none"
      data-fs={isFullscreen}
    >
      <div className="mb-6">
        <StatusBadge status={status} />
      </div>

      <ClockFace face={clockStyle?.face ?? "digital"} size="lg" />

      <div className="mt-8 flex items-center gap-6 text-slate-400">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide">Worked Today</p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">{formatDuration(workedSeconds)}</p>
        </div>
        <div className="h-8 w-px bg-surface-border" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide">Target</p>
          <p className="mt-1 font-mono text-xl font-semibold text-white">{targetHours}h</p>
        </div>
      </div>

      <Button variant="secondary" className="mt-10" onClick={toggleFullscreen}>
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        {isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
      </Button>
    </div>
  );
}
