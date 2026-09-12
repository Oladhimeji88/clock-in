import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "clockin.db");

export const db = new DatabaseSync(dbPath, { enableForeignKeyConstraints: true });
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('hr','employee')),
    target_hours REAL NOT NULL DEFAULT 8,
    clock_style TEXT NOT NULL DEFAULT '{"face":"digital","accent":"indigo","theme":"dark"}',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('clock_in','clock_out','break_start','break_end','leave_start','leave_end')),
    ts INTEGER NOT NULL,
    note TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_events_user_ts ON attendance_events(user_id, ts);
`);

function seedDefaultHr() {
  const existing = db.prepare("SELECT id FROM users WHERE role = 'hr' LIMIT 1").get();
  if (existing) return;

  const email = process.env.DEFAULT_HR_EMAIL || "hr@clockin.app";
  const password = process.env.DEFAULT_HR_PASSWORD || "ChangeMe123!";
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, role, target_hours) VALUES (?, ?, ?, ?, 'hr', 8)`
  ).run(crypto.randomUUID(), email, passwordHash, "HR Administrator");

  console.log("─".repeat(56));
  console.log(" Default HR account created:");
  console.log(`   email:    ${email}`);
  console.log(`   password: ${password}`);
  console.log(" Change this after first login.");
  console.log("─".repeat(56));
}

seedDefaultHr();
