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

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email or password" });

  const { email, password } = parsed.data;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
  if (user.role === "employee" && user.account_status === "disabled") {
    return res.status(403).json({ error: "This account has been disabled. Contact People Operations." });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ token, user: serializeEmployee(user) });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user!.id) as any;
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(serializeEmployee(user));
});
