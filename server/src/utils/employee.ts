import { db } from "../db.js";

const TONES = [
  "bg-accent-100 text-accent-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

export function initialsFor(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "NA").slice(0, 2);
}

export function toneFor(id: string): string {
  return TONES[hash(id) % TONES.length];
}

function formatLastClockIn(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const isSameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isSameDay) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

export function lastClockInFor(userId: string): string {
  const row = db
    .prepare("SELECT ts FROM attendance_events WHERE user_id = ? AND type = 'clock_in' ORDER BY ts DESC LIMIT 1")
    .get(userId) as { ts: number } | undefined;
  return row ? formatLastClockIn(row.ts) : "—";
}

export function serializeEmployee(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    jobTitle: row.job_title,
    expectedHours: row.expected_hours,
    workingDays: JSON.parse(row.working_days),
    startTime: row.start_time,
    endTime: row.end_time,
    breakAllowanceMin: row.break_allowance_min,
    accountStatus: row.account_status,
    initials: initialsFor(row.name),
    tone: toneFor(row.id),
    lastClockIn: lastClockInFor(row.id),
    clockSettings: JSON.parse(row.clock_settings),
    createdAt: row.created_at,
  };
}
