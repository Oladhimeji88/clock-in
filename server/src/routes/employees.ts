import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";
import { serializeEmployee } from "../utils/employee.js";

export const employeesRouter = Router();

employeesRouter.use(requireAuth, requireRole("hr"));

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1),
  role: z.enum(["employee", "hr"]).default("employee"),
  department: z.string().default(""),
  jobTitle: z.string().default(""),
  expectedHours: z.number().min(0).max(24).default(8),
  workingDays: z.array(z.string()).default(["Mon", "Tue", "Wed", "Thu", "Fri"]),
  startTime: z.string().default("09:00"),
  endTime: z.string().default("17:00"),
  breakAllowanceMin: z.number().min(0).max(480).default(60),
  accountStatus: z.enum(["active", "disabled", "invited"]).default("active"),
});

employeesRouter.get("/", async (_req, res) => {
  const rows = await db.all("SELECT * FROM users WHERE role = 'employee' ORDER BY created_at DESC");
  res.json(await Promise.all(rows.map(serializeEmployee)));
});

employeesRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const data = parsed.data;

  const existing = await db.get("SELECT id FROM users WHERE email = ?", [data.email.toLowerCase()]);
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(data.password, 10);

  await db.run(
    `INSERT INTO users
      (id, email, password_hash, name, role, department, job_title, expected_hours, working_days, start_time, end_time, break_allowance_min, account_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.email.toLowerCase(),
      passwordHash,
      data.name,
      data.role,
      data.department,
      data.jobTitle,
      data.expectedHours,
      JSON.stringify(data.workingDays),
      data.startTime,
      data.endTime,
      data.breakAllowanceMin,
      data.accountStatus,
    ]
  );

  const row = await db.get("SELECT * FROM users WHERE id = ?", [id]);
  res.status(201).json(await serializeEmployee(row));
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  expectedHours: z.number().min(0).max(24).optional(),
  workingDays: z.array(z.string()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  breakAllowanceMin: z.number().min(0).max(480).optional(),
  accountStatus: z.enum(["active", "disabled", "invited"]).optional(),
  password: z.string().min(6).optional(),
});

employeesRouter.put("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const user = await db.get("SELECT * FROM users WHERE id = ? AND role = 'employee'", [req.params.id]);
  if (!user) return res.status(404).json({ error: "Employee not found" });

  const d = parsed.data;
  await db.run(
    `UPDATE users SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      department = COALESCE(?, department),
      job_title = COALESCE(?, job_title),
      expected_hours = COALESCE(?, expected_hours),
      working_days = COALESCE(?, working_days),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time),
      break_allowance_min = COALESCE(?, break_allowance_min),
      account_status = COALESCE(?, account_status),
      password_hash = COALESCE(?, password_hash)
    WHERE id = ?`,
    [
      d.name ?? null,
      d.email?.toLowerCase() ?? null,
      d.department ?? null,
      d.jobTitle ?? null,
      d.expectedHours ?? null,
      d.workingDays ? JSON.stringify(d.workingDays) : null,
      d.startTime ?? null,
      d.endTime ?? null,
      d.breakAllowanceMin ?? null,
      d.accountStatus ?? null,
      d.password ? bcrypt.hashSync(d.password, 10) : null,
      req.params.id,
    ]
  );

  const row = await db.get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  res.json(await serializeEmployee(row));
});

employeesRouter.delete("/:id", async (req, res) => {
  const result = await db.run("DELETE FROM users WHERE id = ? AND role = 'employee'", [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: "Employee not found" });
  res.json({ ok: true });
});
