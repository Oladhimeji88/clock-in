export type EventType = "clock_in" | "clock_out" | "break_start" | "break_end";

export interface AttendanceEvent {
  type: EventType;
  ts: number;
}

export type Status = "clocked_out" | "working" | "on_break";

export interface Summary {
  status: Status;
  workedMs: number;
  breakMs: number;
  firstClockIn: number | null;
  lastClockOut: number | null;
  lastBreakStart: number | null;
  lastBreakEnd: number | null;
  ongoing: boolean;
}

/**
 * Reduces an ordered list of attendance events (scoped to one calendar day)
 * into a summary. `asOf` closes out any still-open session — live "now" for
 * today, or the end of that day for a historical record.
 */
export function summarizeEvents(events: AttendanceEvent[], asOf: number): Summary {
  let status: Status = "clocked_out";
  let workStart: number | null = null;
  let breakStart: number | null = null;
  let workedMs = 0;
  let breakMs = 0;
  let firstClockIn: number | null = null;
  let lastClockOut: number | null = null;
  let lastBreakStart: number | null = null;
  let lastBreakEnd: number | null = null;

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
          lastBreakStart = e.ts;
          lastBreakEnd = null;
        }
        break;
      case "break_end":
        if (status === "on_break" && breakStart !== null) {
          breakMs += e.ts - breakStart;
          status = "working";
          workStart = e.ts;
          lastBreakEnd = e.ts;
        }
        break;
    }
  }

  const ongoing = status === "working" || status === "on_break";

  if (status === "working" && workStart !== null) workedMs += asOf - workStart;
  if (status === "on_break" && breakStart !== null) breakMs += asOf - breakStart;

  return { status, workedMs, breakMs, firstClockIn, lastClockOut, lastBreakStart, lastBreakEnd, ongoing };
}

export type SessionStatus = "not_in" | "working" | "break" | "out";

export interface BreakSpan {
  start: number;
  end: number | null;
}

export interface ClockSession {
  status: SessionStatus;
  clockInAt: number | null;
  clockOutAt: number | null;
  breaks: BreakSpan[];
}

/**
 * Derives the live session for the current clock-in cycle: everything since
 * the most recent clock_in event. A fresh clock_in always starts a clean
 * session (mirrors clocking out and back in during the same day).
 */
export function deriveSession(events: AttendanceEvent[]): ClockSession {
  const sorted = [...events].sort((a, b) => a.ts - b.ts);
  let lastInIndex = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].type === "clock_in") {
      lastInIndex = i;
      break;
    }
  }
  if (lastInIndex === -1) {
    return { status: "not_in", clockInAt: null, clockOutAt: null, breaks: [] };
  }

  const clockInAt = sorted[lastInIndex].ts;
  const breaks: BreakSpan[] = [];
  let clockOutAt: number | null = null;
  let status: SessionStatus = "working";

  for (let i = lastInIndex + 1; i < sorted.length; i++) {
    const e = sorted[i];
    if (e.type === "break_start") {
      breaks.push({ start: e.ts, end: null });
      status = "break";
    } else if (e.type === "break_end") {
      const open = breaks.find((b) => b.end === null);
      if (open) open.end = e.ts;
      status = "working";
    } else if (e.type === "clock_out") {
      clockOutAt = e.ts;
      status = "out";
    }
  }

  return { status, clockInAt, clockOutAt, breaks };
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

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekdayAbbr(date: Date): string {
  return WEEKDAY_ABBR[date.getDay()];
}

export function isWorkingDay(date: Date, workingDays: string[]): boolean {
  return workingDays.includes(weekdayAbbr(date));
}

/** Minutes after midnight for a "HH:MM" string. */
export function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export type DayStatus = "working" | "break" | "out" | "leave" | "late" | "absent" | "not_in";

export interface DayRecord {
  status: DayStatus;
  clockIn: number | null;
  breakStart: number | null;
  breakEnd: number | null;
  clockOut: number | null;
  workedMs: number;
  expectedMs: number;
}

/**
 * Builds one day's attendance record for a single employee, matching the
 * status vocabulary the UI expects (working/break/out/leave/late/absent/not_in).
 */
export function buildDayRecord(params: {
  date: Date;
  events: AttendanceEvent[];
  hasApprovedLeave: boolean;
  isToday: boolean;
  now: number;
  startTime: string;
  expectedHours: number;
  workingDays: string[];
  graceMinutes: number;
}): DayRecord {
  const { date, events, hasApprovedLeave, isToday, now, startTime, expectedHours, workingDays, graceMinutes } =
    params;
  const expectedMs = expectedHours * 3_600_000;

  if (hasApprovedLeave) {
    return { status: "leave", clockIn: null, breakStart: null, breakEnd: null, clockOut: null, workedMs: 0, expectedMs };
  }

  if (events.length === 0) {
    if (isToday) {
      return { status: "not_in", clockIn: null, breakStart: null, breakEnd: null, clockOut: null, workedMs: 0, expectedMs };
    }
    if (isWorkingDay(date, workingDays)) {
      return { status: "absent", clockIn: null, breakStart: null, breakEnd: null, clockOut: null, workedMs: 0, expectedMs };
    }
    return { status: "out", clockIn: null, breakStart: null, breakEnd: null, clockOut: null, workedMs: 0, expectedMs };
  }

  const asOf = isToday ? now : endOfDay(date);
  const summary = summarizeEvents(events, asOf);

  let status: DayStatus;
  const late =
    summary.firstClockIn !== null &&
    new Date(summary.firstClockIn).getHours() * 60 + new Date(summary.firstClockIn).getMinutes() >
      minutesOfDay(startTime) + graceMinutes;

  if (late) {
    status = "late";
  } else if (isToday && summary.status === "working") {
    status = "working";
  } else if (isToday && summary.status === "on_break") {
    status = "break";
  } else {
    status = "out";
  }

  return {
    status,
    clockIn: summary.firstClockIn,
    breakStart: summary.lastBreakStart,
    breakEnd: summary.lastBreakEnd,
    clockOut: summary.ongoing ? null : summary.lastClockOut,
    workedMs: summary.workedMs,
    expectedMs,
  };
}
