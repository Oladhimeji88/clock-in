import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";
import { startOfDay, summarizeEvents, type AttendanceEvent } from "../utils/time.js";

export const employeesRouter = Router();

employeesRouter.use(requireAuth, requireRole("hr"));

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1),
  targetHours: z.number().min(0).max(24).default(8),
});

employeesRouter.get("/", (_req, res) => {
  const employees = db
    .prepare("SELECT * FROM users WHERE role = 'employee' ORDER BY created_at DESC")
    .all() as any[];

  const todayStart = startOfDay(new Date());
  const now = Date.now();

  const withStatus = employees.map((u) => {
    const events = db
      .prepare("SELECT type, ts FROM attendance_events WHERE user_id = ? AND ts >= ? ORDER BY ts ASC")
      .all(u.id, todayStart) as unknown as AttendanceEvent[];
    const summary = summarizeEvents(events, now);
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      targetHours: u.target_hours,
      clockStyle: JSON.parse(u.clock_style),
      active: !!u.active,
      createdAt: u.created_at,
      status: summary.status,
      workedHoursToday: +(summary.workedMs / 3_600_000).toFixed(2),
      breakHoursToday: +(summary.breakMs / 3_600_000).toFixed(2),
    };
  });

  res.json(withStatus);
});

employeesRouter.post("/", (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { email, password, name, targetHours } = parsed.data;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, role, target_hours) VALUES (?, ?, ?, ?, 'employee', ?)`
  ).run(id, email.toLowerCase(), passwordHash, name, targetHours);

  res.status(201).json({ id, email: email.toLowerCase(), name, targetHours, role: "employee" });
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  targetHours: z.number().min(0).max(24).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

employeesRouter.put("/:id", (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const user = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'employee'").get(req.params.id) as any;
  if (!user) return res.status(404).json({ error: "Employee not found" });

  const { name, targetHours, active, password } = parsed.data;
  db.prepare(
    `UPDATE users SET
      name = COALESCE(?, name),
      target_hours = COALESCE(?, target_hours),
      active = COALESCE(?, active),
      password_hash = COALESCE(?, password_hash)
    WHERE id = ?`
  ).run(
    name ?? null,
    targetHours ?? null,
    active === undefined ? null : active ? 1 : 0,
    password ? bcrypt.hashSync(password, 10) : null,
    req.params.id
  );

  res.json({ ok: true });
});

employeesRouter.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM users WHERE id = ? AND role = 'employee'").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Employee not found" });
  res.json({ ok: true });
});
