import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../db.js";
import { signToken, requireAuth } from "../auth-middleware.js";
import { serializeEmployee } from "../utils/employee.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email or password" });

  const { email, password } = parsed.data;
  const user = (await db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()])) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
  if (user.role === "employee" && user.account_status === "disabled") {
    return res.status(403).json({ error: "This account has been disabled. Contact People Operations." });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ token, user: await serializeEmployee(user) });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await db.get("SELECT * FROM users WHERE id = ?", [req.user!.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(await serializeEmployee(user));
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

authRouter.put("/password", requireAuth, async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const user = (await db.get("SELECT * FROM users WHERE id = ?", [req.user!.id])) as any;
  if (!user || !bcrypt.compareSync(parsed.data.currentPassword, user.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [
    bcrypt.hashSync(parsed.data.newPassword, 10),
    req.user!.id,
  ]);
  res.json({ ok: true });
});
