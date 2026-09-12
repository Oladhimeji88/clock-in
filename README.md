# ChronoTrack — Time & Attendance

A clock-in/clock-out system with an HR console and an employee time-tracking
dashboard.

## Stack

- **Backend:** Node.js, Express, TypeScript, SQLite (Node's built-in
  `node:sqlite`), JWT auth, bcrypt password hashing.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion.

## Getting started

```bash
npm run install:all   # installs server and client dependencies
npm run dev            # runs the API (port 4000) and the web app (port 5173)
```

Then open **http://localhost:5173**.

On first run the server seeds a default HR account and prints the
credentials to the terminal:

```
email:    hr@clockin.app
password: ChangeMe123!
```

Sign in with that account, then go to **Employees → Add employee** to create
employee logins. Change the default HR password by editing `server/.env`
(`DEFAULT_HR_EMAIL` / `DEFAULT_HR_PASSWORD`) before the first run.

## What's included

**HR console** (`/hr`)
- Dashboard with live headcount, currently-clocked-in / on-break / on-leave /
  late counts, and a live per-employee attendance table.
- Employee directory: create accounts (name, email, temporary password,
  department, job title, working days, schedule, break allowance), edit
  details, enable/disable accounts.
- Employee profile page with today's status, a weekly hours chart, and
  attendance/leave/break history.
- Attendance and Time Records explorers — filter by employee, department,
  status, and date range; export the filtered set to CSV.
- Leave requests — approve or reject employee requests, with a pending-count
  badge in the sidebar.
- Reports — department-level hours worked vs. expected, utilisation, and
  lateness, with CSV export.
- Company settings (name, timezone) and cosmetic working-hour/leave policy
  fields (not yet enforced server-side — see note below).

**Employee dashboard** (`/me`)
- Clock In / Clock Out and Start/End Break, backed by a server-side state
  machine (invalid transitions like double clock-in are rejected).
- A live circular progress ring showing hours worked against the HR-set
  daily target, plus a draggable floating mini clock widget.
- A full-screen clock view (Fullscreen API) for a kiosk-style display.
- Personal clock customization — 5 styles × 5 themes, 12/24-hour, and which
  fields are visible — saved per user.
- Request leave (type, dates, reason) and track its approval status; a
  history page with a weekly chart and a searchable attendance table.

## Project layout

```
server/   Express API + SQLite database (server/data/clockin.db)
client/   React app (design system in client/src/components/ui)
```

## Scope notes

- **Late/absent detection** uses a fixed 10-minute grace period against each
  employee's scheduled start time — the "Late grace period" field on the HR
  Settings page is currently cosmetic (not wired to this).
- **Company details** (name, timezone) on the Settings page persist for real;
  the other policy toggles there (break rules, leave allowance, export
  format, etc.) are UI-only for now — no backend enforces them yet.
- **CSV export** is generated client-side from the same data the on-screen
  tables use, respecting whatever filters are active.

## Production notes

- `server/.env` holds `JWT_SECRET` and the default HR credentials — replace
  `JWT_SECRET` with a strong random value before deploying, and don't commit
  `.env`.
- The SQLite file lives at `server/data/clockin.db`; back it up like any
  other database file. This won't work on a serverless host with an
  ephemeral filesystem (e.g. Vercel functions) — see below.
- CORS is wide open (`cors()` with no options) for local development —
  restrict it to your real frontend origin before deploying.

## Deploying

The frontend (`client/`) is a static Vite build and deploys anywhere static
sites do, Vercel included. The backend (`server/`) is a normal long-running
Node/Express process with a local SQLite file — it needs a host that gives it
a persistent filesystem and keeps the process alive (Railway, Render, Fly.io,
a VPS, etc.), or a swap to a hosted database (e.g. Turso/LibSQL, Postgres) if
you want it on a serverless platform. Point the frontend's `/api` requests at
wherever the backend ends up (update the Vite proxy for local dev, and set a
real API base URL for the production build).
