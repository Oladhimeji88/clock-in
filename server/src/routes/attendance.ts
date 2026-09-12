import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";
import { startOfDay, summarizeEvents, type AttendanceEvent } from "../utils/time.js";

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth, requireRole("employee"));

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

attendanceRouter.get("/status", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user!.id) as any;
  const events = getTodayEvents(req.user!.id);
  const summary = summarizeEvents(events, Date.now());

  res.json({
    status: summary.status,
    workedSeconds: Math.floor(summary.workedMs / 1000),
    breakSeconds: Math.floor(summary.breakMs / 1000),
    targetHours: user.target_hours,
    firstClockIn: summary.firstClockIn,
    clockStyle: JSON.parse(user.clock_style),
    serverTime: Date.now(),
  });
});

function transition(allowedFrom: string[], type: AttendanceEvent["type"]) {
  return (req: any, res: any) => {
    const events = getTodayEvents(req.user!.id);
    const summary = summarizeEvents(events, Date.now());
    if (!allowedFrom.includes(summary.status)) {
      return res.status(409).json({ error: `Cannot do this while status is '${summary.status}'` });
    }
    insertEvent(req.user!.id, type);
    res.json({ ok: true });
  };
}

attendanceRouter.post("/clock-in", transition(["clocked_out"], "clock_in"));
attendanceRouter.post("/clock-out", transition(["working", "on_break"], "clock_out"));
attendanceRouter.post("/break/start", transition(["working"], "break_start"));
attendanceRouter.post("/break/end", transition(["on_break"], "break_end"));
attendanceRouter.post("/leave/start", transition(["clocked_out"], "leave_start"));
attendanceRouter.post("/leave/end", transition(["on_leave"], "leave_end"));

const styleSchema = z.object({
  face: z.enum(["digital", "analog", "minimal", "flip", "neon"]),
  accent: z.enum(["indigo", "emerald", "rose", "amber", "sky", "violet"]),
  theme: z.enum(["dark", "light"]),
});

attendanceRouter.put("/clock-style", (req, res) => {
  const parsed = styleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid clock style" });
  db.prepare("UPDATE users SET clock_style = ? WHERE id = ?").run(
    JSON.stringify(parsed.data),
    req.user!.id
  );
  res.json({ ok: true });
});

attendanceRouter.get("/history", (req, res) => {
  const events = db
    .prepare("SELECT type, ts FROM attendance_events WHERE user_id = ? ORDER BY ts DESC LIMIT 200")
    .all(req.user!.id);
  res.json(events);
});
