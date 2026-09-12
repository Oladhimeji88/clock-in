import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";

export const companyRouter = Router();

companyRouter.get("/", requireAuth, (_req, res) => {
  const row = db.prepare("SELECT name, timezone FROM company_settings WHERE id = 'default'").get() as any;
  res.json({ name: row.name, timezone: row.timezone });
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
});

companyRouter.put("/", requireAuth, requireRole("hr"), (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  db.prepare("UPDATE company_settings SET name = COALESCE(?, name), timezone = COALESCE(?, timezone) WHERE id = 'default'").run(
    parsed.data.name ?? null,
    parsed.data.timezone ?? null
  );
  const row = db.prepare("SELECT name, timezone FROM company_settings WHERE id = 'default'").get() as any;
  res.json({ name: row.name, timezone: row.timezone });
});
