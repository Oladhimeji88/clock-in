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

function getTodayEvents(userId: string): AttendanceEvent[] {
  const todayStart = startOfDay(new Date());
  return db
    .prepare("SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts >= ? ORDER BY ts ASC")
    .all(userId, todayStart) as unknown as AttendanceEvent[];
}

function insertEvent(userId: string, type: AttendanceEvent["type"]) {
  db.prepare("INSERT INTO attendance_events (id, user_id, type, ts) VALUES (?, ?, ?, ?)").run(
    crypto.randomUUID(),
    userId,
    type,
    Date.now()
  );
}

function hasApprovedLeaveOn(employeeId: string, day: string): boolean {
  const row = db
    .prepare(
      `SELECT id FROM leave_requests
       WHERE employee_id = ? AND status = 'Approved' AND start_date <= ? AND end_date >= ? LIMIT 1`
    )
    .get(employeeId, day, day);
  return !!row;
}

// ---- Employee: live session ----

const employeeOnly = [requireAuth, requireRole("employee")] as const;

attendanceRouter.get("/session", ...employeeOnly, (req, res) => {
  res.json(deriveSession(getTodayEvents(req.user!.id)));
});

function transition(allowedFrom: string[], type: AttendanceEvent["type"]) {
  return (req: any, res: any) => {
    const session = deriveSession(getTodayEvents(req.user!.id));
    if (!allowedFrom.includes(session.status)) {
      return res.status(409).json({ error: `Cannot do this while status is '${session.status}'` });
    }
    insertEvent(req.user!.id, type);
    res.json(deriveSession(getTodayEvents(req.user!.id)));
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

attendanceRouter.put("/clock-settings", ...employeeOnly, (req, res) => {
  const parsed = clockSettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid clock settings" });
  db.prepare("UPDATE users SET clock_settings = ? WHERE id = ?").run(JSON.stringify(parsed.data), req.user!.id);
  res.json({ ok: true });
});

// ---- Records (historical day-by-day) ----

function employeeRow(id: string): any {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function recordsForRange(employee: any, from: string, to: string) {
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
    const events = db
      .prepare("SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts >= ? AND ts < ? ORDER BY ts ASC")
      .all(employee.id, dayStart, dayEnd) as unknown as AttendanceEvent[];

    const record = buildDayRecord({
      date: day,
      events,
      hasApprovedLeave: hasApprovedLeaveOn(employee.id, key),
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

attendanceRouter.get("/records/me", ...employeeOnly, (req, res) => {
  const { from, to } = { ...defaultRange(30), ...(req.query as any) };
  const employee = employeeRow(req.user!.id);
  res.json(recordsForRange(employee, from, to));
});

// ---- HR: today snapshot + records across employees ----

const hrOnly = [requireAuth, requireRole("hr")] as const;

attendanceRouter.get("/today", ...hrOnly, (_req, res) => {
  const employees = db.prepare("SELECT * FROM users WHERE role = 'employee'").all() as any[];
  const now = Date.now();
  const today = new Date();
  const key = dateKey(now);

  const records = employees.map((employee) => {
    const workingDays = JSON.parse(employee.working_days) as string[];
    const dayStart = startOfDay(today);
    const events = db
      .prepare("SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts >= ? ORDER BY ts ASC")
      .all(employee.id, dayStart) as unknown as AttendanceEvent[];

    const record = buildDayRecord({
      date: today,
      events,
      hasApprovedLeave: hasApprovedLeaveOn(employee.id, key),
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
  });

  res.json(records);
});

attendanceRouter.get("/records", ...hrOnly, (req, res) => {
  const { employeeId, from, to } = { ...defaultRange(14), ...(req.query as any) };

  const employees = employeeId
    ? [employeeRow(String(employeeId))].filter(Boolean)
    : (db.prepare("SELECT * FROM users WHERE role = 'employee'").all() as any[]);

  const all = employees.flatMap((e) => recordsForRange(e, from, to));
  res.json(all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)));
});
