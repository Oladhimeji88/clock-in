# ChronoTrack — Time & Attendance

A clock-in/clock-out system with an HR console and an employee time-tracking
dashboard.

**Live:** https://client-eta-jade-12.vercel.app (API: https://server-nine-jet-90.vercel.app)

## Stack

- **Backend:** Node.js, Express, TypeScript, LibSQL/Turso (SQLite-compatible,
  works locally against a file and in production against a hosted database),
  JWT auth, bcrypt password hashing. Deployed as a Vercel serverless function.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion.
  Deployed as a static Vercel site.

## Getting started (local dev)

```bash
npm run install:all   # installs server and client dependencies
npm run dev            # runs the API (port 4000) and the web app (port 5173)
```

Then open **http://localhost:5173**. Local dev uses a SQLite file at
`server/data/clockin.db` — no database account needed.

On first run the server seeds a default HR account and prints the
credentials to the terminal:

```
email:    hr@clockin.app
password: ChangeMe123!
```

Sign in with that account, then go to **Employees → Add employee** to create
employee logins. Change the default local password via `server/.env`
(`DEFAULT_HR_EMAIL` / `DEFAULT_HR_PASSWORD`) before the first run, or from
inside the app afterward (**Settings → Your account**, once logged in).

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
- Company settings (name, timezone) and its own password change, plus
  cosmetic working-hour/leave policy fields (not yet enforced server-side —
  see note below).

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
- Password change under Settings.

## Project layout

```
server/       Express API
  src/app.ts    the actual Express app (routes, middleware — no listen())
  src/index.ts  local dev entry point (imports app.ts, calls listen())
  api/index.ts  Vercel serverless entry point (imports app.ts, no listen())
  src/db.ts     LibSQL client — a local file by default, or DATABASE_URL/
                DATABASE_AUTH_TOKEN for a hosted (Turso) database
client/       React app (design system in client/src/components/ui)
```

## Scope notes

- **Late/absent detection** uses a fixed 10-minute grace period against each
  employee's scheduled start time — the "Late grace period" field on the HR
  Settings page is currently cosmetic (not wired to this).
- **Company details** (name, timezone) and **password change** on the
  Settings pages persist for real; the other policy toggles (break rules,
  leave allowance, export format, etc.) are UI-only for now — no backend
  enforces them yet.
- **CSV export** is generated client-side from the same data the on-screen
  tables use, respecting whatever filters are active.

## Deployment

Two separate Vercel projects, both deployed from this repo:

- **`client/`** — Vite static build. Env var `VITE_API_URL` points it at the
  deployed API's `/api` base (baked in at build time).
- **`server/`** — Express app exported from `api/index.ts`, with
  `vercel.json` rewriting every `/api/*` request to that one function
  (see the "Project layout" note above for why it's not a bracket
  catch-all file — that only matched single-segment paths in practice).
  Env vars: `JWT_SECRET`, `DEFAULT_HR_EMAIL`, `DEFAULT_HR_PASSWORD`,
  `FRONTEND_URL` (CORS allowlist), `DATABASE_URL` + `DATABASE_AUTH_TOKEN`
  (Turso — `libsql://...` and a bearer token from `turso db tokens create`).

To redeploy either side after changes:

```bash
cd client && vercel deploy --prod   # or: cd server && vercel deploy --prod
```

To change an env var: `vercel env rm <NAME> production` then
`vercel env add <NAME> production` (from inside the relevant project
directory), then redeploy so the new value takes effect.
