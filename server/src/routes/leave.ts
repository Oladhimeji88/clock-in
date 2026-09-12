import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";
import { dateKey } from "../utils/time.js";

export const leaveRouter = Router();
leaveRouter.use(requireAuth);

function serializeLeave(row: any) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    status: row.status,
    reason: row.reason,
    submittedAt: row.submitted_at,
  };
}

const submitSchema = z.object({
  type: z.enum(["Annual Leave", "Sick Leave", "Personal Leave", "Other"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().default(""),
});

leaveRouter.post("/", requireRole("employee"), async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid leave request" });
  const { type, startDate, endDate, reason } = parsed.data;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  const id = crypto.randomUUID();
  await db.run(
    `INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, status, reason, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
    [id, req.user!.id, type, startDate, endDate, days, reason, dateKey(Date.now())]
  );

  const row = await db.get("SELECT * FROM leave_requests WHERE id = ?", [id]);
  res.status(201).json(serializeLeave(row));
});

leaveRouter.get("/me", requireRole("employee"), async (req, res) => {
  const rows = await db.all("SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY submitted_at DESC", [
    req.user!.id,
  ]);
  res.json(rows.map(serializeLeave));
});

leaveRouter.get("/", requireRole("hr"), async (_req, res) => {
  const rows = await db.all("SELECT * FROM leave_requests ORDER BY submitted_at DESC");
  res.json(rows.map(serializeLeave));
});

const decisionSchema = z.object({ status: z.enum(["Approved", "Rejected"]) });

leaveRouter.put("/:id", requireRole("hr"), async (req, res) => {
  const parsed = decisionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid status" });
  const result = await db.run("UPDATE leave_requests SET status = ? WHERE id = ?", [
    parsed.data.status,
    req.params.id,
  ]);
  if (result.changes === 0) return res.status(404).json({ error: "Leave request not found" });
  const row = await db.get("SELECT * FROM leave_requests WHERE id = ?", [req.params.id]);
  res.json(serializeLeave(row));
});
