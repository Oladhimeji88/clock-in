export type EventType =
  | "clock_in"
  | "clock_out"
  | "break_start"
  | "break_end"
  | "leave_start"
  | "leave_end";

export interface AttendanceEvent {
  type: EventType;
  ts: number;
}

export type Status = "clocked_out" | "working" | "on_break" | "on_leave";

export interface Summary {
  status: Status;
  workedMs: number;
  breakMs: number;
  firstClockIn: number | null;
  lastClockOut: number | null;
  ongoing: boolean;
}

/**
 * Reduces an ordered list of attendance events into a summary. `asOf` is the
 * timestamp used to close out any still-open session (live "now", or the end
 * of a historical day when summarizing past records).
 */
export function summarizeEvents(events: AttendanceEvent[], asOf: number): Summary {
  let status: Status = "clocked_out";
  let workStart: number | null = null;
  let breakStart: number | null = null;
  let workedMs = 0;
  let breakMs = 0;
  let firstClockIn: number | null = null;
  let lastClockOut: number | null = null;

  const sorted = [...events].sort((a, b) => a.ts - b.ts);

  for (const e of sorted) {
    switch (e.type) {
      case "clock_in":
        status = "working";
        workStart = e.ts;
        if (firstClockIn === null) firstClockIn = e.ts;
        break;
      case "clock_out":
        if (status === "working" && workStart !== null) workedMs += e.ts - workStart;
        if (status === "on_break" && breakStart !== null) breakMs += e.ts - breakStart;
        status = "clocked_out";
        workStart = null;
        breakStart = null;
        lastClockOut = e.ts;
        break;
      case "break_start":
        if (status === "working" && workStart !== null) {
          workedMs += e.ts - workStart;
          status = "on_break";
          breakStart = e.ts;
        }
        break;
      case "break_end":
        if (status === "on_break" && breakStart !== null) {
          breakMs += e.ts - breakStart;
          status = "working";
          workStart = e.ts;
        }
        break;
      case "leave_start":
        status = "on_leave";
        break;
      case "leave_end":
        status = "clocked_out";
        break;
    }
  }

  const ongoing = status === "working" || status === "on_break";

  if (status === "working" && workStart !== null) workedMs += asOf - workStart;
  if (status === "on_break" && breakStart !== null) breakMs += asOf - breakStart;

  return { status, workedMs, breakMs, firstClockIn, lastClockOut, ongoing };
}

export function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
