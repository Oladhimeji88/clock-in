import { useEffect } from "react";
import { toast } from "sonner";
import { LogIn, LogOut, Coffee, PlaneTakeoff, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockFace } from "@/components/clock-faces/ClockFace";
import { HourCountPanel } from "@/components/HourCountPanel";
import { useAttendanceStatus } from "@/hooks/useAttendanceStatus";
import { useAuthStore } from "@/lib/auth-store";

export default function ClockIn() {
  const user = useAuthStore((s) => s.user);
  const {
    status,
    targetHours,
    clockStyle,
    workedSeconds,
    breakSeconds,
    busy,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    startLeave,
    endLeave,
  } = useAttendanceStatus();

  useEffect(() => {
    if (clockStyle) document.documentElement.dataset.accent = clockStyle.accent;
  }, [clockStyle]);

  async function handle(action: () => Promise<void>, successMsg: string) {
    try {
      await action();
      toast.success(successMsg);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Something went wrong");
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-400">Here's your attendance for today.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 flex flex-col items-center justify-center p-10">
          <ClockFace face={clockStyle?.face ?? "digital"} size="lg" />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {status === "clocked_out" && (
              <Button size="lg" onClick={() => handle(clockIn, "Clocked in — have a great day!")} disabled={busy}>
                <LogIn className="h-4 w-4" />
                Clock In
              </Button>
            )}
            {(status === "working" || status === "on_break") && (
              <Button size="lg" variant="danger" onClick={() => handle(clockOut, "Clocked out. See you tomorrow!")} disabled={busy}>
                <LogOut className="h-4 w-4" />
                Clock Out
              </Button>
            )}
            {status === "working" && (
              <Button size="lg" variant="secondary" onClick={() => handle(startBreak, "Break started")} disabled={busy}>
                <Coffee className="h-4 w-4" />
                Start Break
              </Button>
            )}
            {status === "on_break" && (
              <Button size="lg" variant="success" onClick={() => handle(endBreak, "Break ended, welcome back")} disabled={busy}>
                <PlayCircle className="h-4 w-4" />
                End Break
              </Button>
            )}
            {status === "clocked_out" && (
              <Button size="lg" variant="outline" onClick={() => handle(startLeave, "Marked as on leave")} disabled={busy}>
                <PlaneTakeoff className="h-4 w-4" />
                Go On Leave
              </Button>
            )}
            {status === "on_leave" && (
              <Button size="lg" variant="outline" onClick={() => handle(endLeave, "Leave ended")} disabled={busy}>
                <PlayCircle className="h-4 w-4" />
                End Leave
              </Button>
            )}
          </div>

          {status === "on_leave" && (
            <p className="mt-4 text-sm text-info-400">You're marked as on leave today.</p>
          )}
        </Card>

        <div className="lg:col-span-2">
          <HourCountPanel
            status={status}
            workedSeconds={workedSeconds}
            breakSeconds={breakSeconds}
            targetHours={targetHours}
          />
        </div>
      </div>
    </div>
  );
}
