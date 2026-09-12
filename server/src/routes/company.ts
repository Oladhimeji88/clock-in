import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../auth-middleware.js";

export const companyRouter = Router();

function serializeCompany(row: any) {
  return {
    name: row.name,
    timezone: row.timezone,
    autoClockoutHours: row.auto_clockout_hours ?? null,
  };
}

companyRouter.get("/", requireAuth, async (_req, res) => {
  const row = await db.get("SELECT name, timezone, auto_clockout_hours FROM company_settings WHERE id = 'default'");
  res.json(serializeCompany(row));
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  autoClockoutHours: z.number().min(1).max(24).nullable().optional(),
});

companyRouter.put("/", requireAuth, requireRole("hr"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const d = parsed.data;

  const current = (await db.get(
    "SELECT auto_clockout_hours FROM company_settings WHERE id = 'default'"
  )) as { auto_clockout_hours: number | null } | undefined;
  const autoClockoutHours = d.autoClockoutHours === undefined ? current?.auto_clockout_hours ?? null : d.autoClockoutHours;

  await db.run(
    `UPDATE company_settings SET
      name = COALESCE(?, name),
      timezone = COALESCE(?, timezone),
      auto_clockout_hours = ?
     WHERE id = 'default'`,
    [d.name ?? null, d.timezone ?? null, autoClockoutHours]
  );
  const row = await db.get("SELECT name, timezone, auto_clockout_hours FROM company_settings WHERE id = 'default'");
  res.json(serializeCompany(row));
});
