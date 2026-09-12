import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "clockin.db");

export const db = new DatabaseSync(dbPath, { enableForeignKeyConstraints: true });
db.exec("PRAGMA journal_mode = WAL");

const DEFAULT_CLOCK_SETTINGS = JSON.stringify({
  style: "segmented",
  theme: "dark",
  hour12: false,
  showSeconds: true,
  showDate: true,
  showDay: true,
  showStatus: true,
  showWorked: true,
  showRemaining: true,
  showProgress: true,
});

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('hr','employee')),
    department TEXT NOT NULL DEFAULT '',
    job_title TEXT NOT NULL DEFAULT '',
    expected_hours REAL NOT NULL DEFAULT 8,
    working_days TEXT NOT NULL DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
    start_time TEXT NOT NULL DEFAULT '09:00',
    end_time TEXT NOT NULL DEFAULT '17:00',
    break_allowance_min INTEGER NOT NULL DEFAULT 60,
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active','disabled','invited')),
    clock_settings TEXT NOT NULL DEFAULT '${DEFAULT_CLOCK_SETTINGS}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('clock_in','clock_out','break_start','break_end')),
    ts INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_user_ts ON attendance_events(user_id, ts);

  CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    days INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
    reason TEXT NOT NULL DEFAULT '',
    submitted_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);

  CREATE TABLE IF NOT EXISTS company_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'Your Company',
    timezone TEXT NOT NULL DEFAULT 'GMT+0 · London'
  );
`);

function seedDefaults() {
  const existingHr = db.prepare("SELECT id FROM users WHERE role = 'hr' LIMIT 1").get();
  if (!existingHr) {
    const email = process.env.DEFAULT_HR_EMAIL || "hr@clockin.app";
    const password = process.env.DEFAULT_HR_PASSWORD || "ChangeMe123!";
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, department, job_title)
       VALUES (?, ?, ?, ?, 'hr', 'People Operations', 'HR Administrator')`
    ).run(crypto.randomUUID(), email, passwordHash, "HR Administrator");

    console.log("─".repeat(56));
    console.log(" Default HR account created:");
    console.log(`   email:    ${email}`);
    console.log(`   password: ${password}`);
    console.log(" Change this after first login.");
    console.log("─".repeat(56));
  }

  const existingCompany = db.prepare("SELECT id FROM company_settings WHERE id = 'default'").get();
  if (!existingCompany) {
    db.prepare("INSERT INTO company_settings (id) VALUES ('default')").run();
  }
}

seedDefaults();
