import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";
import {
  buildDayRecord,
  dateKey,
  deriveSession,
  isWorkingDay,
  startOfDay,
  type AttendanceEvent,
} from "../utils/time.js";

export const attendanceRouter = Router();

const GRACE_MINUTES = 10;

async function insertEvent(userId: string, type: AttendanceEvent["type"], ts: number = Date.now()) {
  await db.run("INSERT INTO attendance_events (id, user_id, type, ts) VALUES (?, ?, ?, ?)", [
    crypto.randomUUID(),
    userId,
    type,
    ts,
  ]);
}

let autoClockoutHoursCache: { value: number | null; fetchedAt: number } | null = null;

/** Company-wide auto-clockout threshold, cached briefly to avoid a query on every request. */
async function getAutoClockoutHours(): Promise<number | null> {
  if (autoClockoutHoursCache && Date.now() - autoClockoutHoursCache.fetchedAt < 30_000) {
    return autoClockoutHoursCache.value;
  }
  const row = (await db.get("SELECT auto_clockout_hours FROM company_settings WHERE id = 'default'")) as
    | { auto_clockout_hours: number | null }
    | undefined;
  const value = row?.auto_clockout_hours ?? null;
  autoClockoutHoursCache = { value, fetchedAt: Date.now() };
  return value;
}

/**
 * If the employee has been clocked in (working or on break) longer than the
 * company's auto-clockout threshold, insert a clock_out event at the moment
 * the threshold was crossed. Idempotent — once inserted, status becomes
 * 'out' and this is a no-op until the next clock-in.
 */
async function enforceAutoClockout(userId: string, events: AttendanceEvent[]): Promise<AttendanceEvent[]> {
  const hours = await getAutoClockoutHours();
  if (!hours) return events;

  const session = deriveSession(events);
  if ((session.status !== "working" && session.status !== "break") || !session.clockInAt) return events;

  const cutoff = session.clockInAt + hours * 3_600_000;
  if (Date.now() < cutoff) return events;

  await insertEvent(userId, "clock_out", cutoff);
  return [...events, { type: "clock_out", ts: cutoff }];
}

async function getTodayEvents(userId: string): Promise<AttendanceEvent[]> {
  const todayStart = startOfDay(new Date());
  const rows = await db.all(
    "SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts >= ? ORDER BY ts ASC",
    [userId, todayStart]
  );
  return enforceAutoClockout(userId, rows as unknown as AttendanceEvent[]);
}

async function hasApprovedLeaveOn(employeeId: string, day: string): Promise<boolean> {
  const row = await db.get(
    `SELECT id FROM leave_requests
     WHERE employee_id = ? AND status = 'Approved' AND start_date <= ? AND end_date >= ? LIMIT 1`,
    [employeeId, day, day]
  );
  return !!row;
}

// ---- Employee: live session ----

const employeeOnly = [requireAuth, requireRole("employee")] as const;

attendanceRouter.get("/session", ...employeeOnly, async (req, res) => {
  res.json(deriveSession(await getTodayEvents(req.user!.id)));
});

function transition(allowedFrom: string[], type: AttendanceEvent["type"]) {
  return async (req: any, res: any) => {
    const session = deriveSession(await getTodayEvents(req.user!.id));
    if (!allowedFrom.includes(session.status)) {
      return res.status(409).json({ error: `Cannot do this while status is '${session.status}'` });
    }
    await insertEvent(req.user!.id, type);
    res.json(deriveSession(await getTodayEvents(req.user!.id)));
  };
}

attendanceRouter.post("/clock-in", ...employeeOnly, transition(["not_in", "out"], "clock_in"));
attendanceRouter.post("/clock-out", ...employeeOnly, transition(["working", "break"], "clock_out"));
attendanceRouter.post("/break/start", ...employeeOnly, transition(["working"], "break_start"));
attendanceRouter.post("/break/end", ...employeeOnly, transition(["break"], "break_end"));

const clockSettingsSchema = z.object({
  style: z.enum(["digital", "segmented", "minimal", "modern", "retro"]),
  theme: z.enum(["dark", "light", "minimal", "glass", "retro"]),
  hour12: z.boolean(),
  showSeconds: z.boolean(),
  showDate: z.boolean(),
  showDay: z.boolean(),
  showStatus: z.boolean(),
  showWorked: z.boolean(),
  showRemaining: z.boolean(),
  showProgress: z.boolean(),
});

attendanceRouter.put("/clock-settings", ...employeeOnly, async (req, res) => {
  const parsed = clockSettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid clock settings" });
  await db.run("UPDATE users SET clock_settings = ? WHERE id = ?", [
    JSON.stringify(parsed.data),
    req.user!.id,
  ]);
  res.json({ ok: true });
});

// ---- Records (historical day-by-day) ----

async function employeeRow(id: string): Promise<any> {
  return db.get("SELECT * FROM users WHERE id = ?", [id]);
}

async function recordsForRange(employee: any, from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const now = Date.now();
  const todayKey = dateKey(now);
  const workingDays = JSON.parse(employee.working_days) as string[];
  const results: any[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);
    const key = dateKey(day.getTime());
    if (!isWorkingDay(day, workingDays)) continue;
    if (key > todayKey) continue;

    const dayStart = startOfDay(day);
    const dayEnd = dayStart + 86_400_000;
    const events = (await db.all(
      "SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts >= ? AND ts < ? ORDER BY ts ASC",
      [employee.id, dayStart, dayEnd]
    )) as unknown as AttendanceEvent[];

    const record = buildDayRecord({
      date: day,
      events,
      hasApprovedLeave: await hasApprovedLeaveOn(employee.id, key),
      isToday: key === todayKey,
      now,
      startTime: employee.start_time,
      expectedHours: employee.expected_hours,
      workingDays,
      graceMinutes: GRACE_MINUTES,
    });

    results.push({
      id: `${employee.id}-${key}`,
      employeeId: employee.id,
      date: key,
      clockIn: record.clockIn ? formatTime(record.clockIn) : null,
      breakStart: record.breakStart ? formatTime(record.breakStart) : null,
      breakEnd: record.breakEnd ? formatTime(record.breakEnd) : null,
      clockOut: record.clockOut ? formatTime(record.clockOut) : null,
      totalMin: Math.round(record.workedMs / 60000),
      expectedMin: Math.round(record.expectedMs / 60000),
      status: record.status,
    });
  }

  return results.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function defaultRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - (days - 1));
  return { from: dateKey(from.getTime()), to: dateKey(to.getTime()) };
}

attendanceRouter.get("/records/me", ...employeeOnly, async (req, res) => {
  const { from, to } = { ...defaultRange(30), ...(req.query as any) };
  const employee = await employeeRow(req.user!.id);
  res.json(await recordsForRange(employee, from, to));
});

// ---- HR: today snapshot + records across employees ----

const hrOnly = [requireAuth, requireRole("hr")] as const;

attendanceRouter.get("/today", ...hrOnly, async (_req, res) => {
  const employees = await db.all("SELECT * FROM users WHERE role = 'employee'");
  const now = Date.now();
  const today = new Date();
  const key = dateKey(now);

  const records = await Promise.all(
    employees.map(async (employee: any) => {
      const workingDays = JSON.parse(employee.working_days) as string[];
      const dayStart = startOfDay(today);
      const rawEvents = (await db.all(
        "SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts >= ? ORDER BY ts ASC",
        [employee.id, dayStart]
      )) as unknown as AttendanceEvent[];
      const events = await enforceAutoClockout(employee.id, rawEvents);

      const record = buildDayRecord({
        date: today,
        events,
        hasApprovedLeave: await hasApprovedLeaveOn(employee.id, key),
        isToday: true,
        now,
        startTime: employee.start_time,
        expectedHours: employee.expected_hours,
        workingDays,
        graceMinutes: GRACE_MINUTES,
      });

      return {
        employeeId: employee.id,
        status: record.status,
        clockIn: record.clockIn ? formatTime(record.clockIn) : null,
        breakStart: record.breakStart ? formatTime(record.breakStart) : null,
        breakEnd: record.breakEnd ? formatTime(record.breakEnd) : null,
        clockOut: record.clockOut ? formatTime(record.clockOut) : null,
        workedMin: Math.round(record.workedMs / 60000),
        expectedMin: Math.round(record.expectedMs / 60000),
      };
    })
  );

  res.json(records);
});

attendanceRouter.get("/records", ...hrOnly, async (req, res) => {
  const { employeeId, from, to } = { ...defaultRange(14), ...(req.query as any) };

  const employees = employeeId
    ? [await employeeRow(String(employeeId))].filter(Boolean)
    : await db.all("SELECT * FROM users WHERE role = 'employee'");

  const perEmployee = await Promise.all(employees.map((e: any) => recordsForRange(e, from, to)));
  const all = perEmployee.flat();
  res.json(all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)));
});
