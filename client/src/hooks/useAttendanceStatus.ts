import { useCallback, useEffect, useRef, useState } from "react";
import { api, type StatusResponse } from "@/lib/api";

export function useAttendanceStatus() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await api.get<StatusResponse>("/attendance/status");
    setData(data);
    setWorkedSeconds(data.workedSeconds);
    setBreakSeconds(data.breakSeconds);
    return data;
  }, []);

  useEffect(() => {
    refresh();
    pollRef.current = window.setInterval(refresh, 20000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [refresh]);

  useEffect(() => {
    if (!data) return;
    const tick = window.setInterval(() => {
      if (data.status === "working") setWorkedSeconds((s) => s + 1);
      if (data.status === "on_break") setBreakSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(tick);
  }, [data?.status]);

  const act = useCallback(
    async (endpoint: string) => {
      setBusy(true);
      try {
        await api.post(`/attendance/${endpoint}`);
        await refresh();
      } finally {
        setBusy(false);
      }
    },
    [refresh]
  );

  return {
    status: data?.status ?? "clocked_out",
    targetHours: data?.targetHours ?? 8,
    clockStyle: data?.clockStyle,
    workedSeconds,
    breakSeconds,
    busy,
    clockIn: () => act("clock-in"),
    clockOut: () => act("clock-out"),
    startBreak: () => act("break/start"),
    endBreak: () => act("break/end"),
    startLeave: () => act("leave/start"),
    endLeave: () => act("leave/end"),
    refresh,
  };
}
