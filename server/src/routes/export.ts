import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";
import { dateKey, endOfDay, startOfDay, summarizeEvents, type AttendanceEvent } from "../utils/time.js";

export const exportRouter = Router();

exportRouter.use(requireAuth, requireRole("hr"));

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function fmtTime(ts: number | null): string {
  if (ts === null) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

exportRouter.get("/csv", (req, res) => {
  const from = req.query.from ? startOfDay(new Date(String(req.query.from))) : startOfDay(new Date(Date.now() - 29 * 86400000));
  const to = req.query.to ? endOfDay(new Date(String(req.query.to))) : endOfDay(new Date());

  const employees = db
    .prepare("SELECT id, name, email, target_hours FROM users WHERE role = 'employee' ORDER BY name ASC")
    .all() as any[];

  const rows: string[] = [
    ["Employee Name", "Email", "Date", "Clock In", "Clock Out", "Break (hrs)", "Worked (hrs)", "Target (hrs)", "Status"]
      .map(csvEscape)
      .join(","),
  ];

  const now = Date.now();

  for (const emp of employees) {
    const events = db
      .prepare("SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts BETWEEN ? AND ? ORDER BY ts ASC")
      .all(emp.id, from, to) as unknown as AttendanceEvent[];

    const byDay = new Map<string, AttendanceEvent[]>();
    for (const e of events) {
      const key = dateKey(e.ts);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(e);
    }

    const sortedDays = [...byDay.keys()].sort();
    for (const day of sortedDays) {
      const dayEvents = byDay.get(day)!;
      const dayEnd = Math.min(endOfDay(new Date(dayEvents[0].ts)), now);
      const summary = summarizeEvents(dayEvents, dayEnd);

      const statusLabel =
        summary.status === "on_leave"
          ? "Leave"
          : summary.ongoing
          ? "In progress"
          : summary.firstClockIn
          ? "Complete"
          : "—";

      rows.push(
        [
          emp.name,
          emp.email,
          day,
          fmtTime(summary.firstClockIn),
          summary.ongoing ? "" : fmtTime(summary.lastClockOut),
          (summary.breakMs / 3_600_000).toFixed(2),
          (summary.workedMs / 3_600_000).toFixed(2),
          emp.target_hours,
          statusLabel,
        ]
          .map(csvEscape)
          .join(",")
      );
    }
  }

  const csv = rows.join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendance-export.csv"`);
  res.send(csv);
});
