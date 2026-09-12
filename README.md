# ChronoTrack — Time & Attendance

A clock-in/clock-out system with an HR console and an employee time-tracking
dashboard.

## Stack

- **Backend:** Node.js, Express, TypeScript, SQLite (Node's built-in
  `node:sqlite`), JWT auth, bcrypt password hashing.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, Framer Motion,
  Zustand.

## Getting started

```bash
npm run install:all   # installs both server and client dependencies
npm run dev            # runs the API (port 4000) and the web app (port 5173)
```

Then open **http://localhost:5173**.

On first run the server seeds a default HR account and prints the
credentials to the terminal:

```
email:    hr@clockin.app
password: ChangeMe123!
```

Sign in with that account, then go to **Employees → Add Employee** to create
employee logins. Change the default HR password by editing `server/.env`
(`DEFAULT_HR_EMAIL` / `DEFAULT_HR_PASSWORD`) before the first run, or add a
password-change flow later.

## What's included

**HR console** (`/hr`)
- Dashboard with live headcount, working/on-break/on-leave counts, and a
  live per-employee status feed (auto-refreshes every 15s).
- Employee management: create accounts (email + temporary password), set
  each employee's daily target hours, reset passwords, remove accounts.
- CSV export of attendance (clock in/out times, break hours, worked hours,
  target hours, status) for the last 30 days by default.

**Employee dashboard** (`/app`)
- Clock In / Clock Out, Start Break / End Break, Go On Leave / End Leave —
  with server-side state machine so invalid transitions (e.g. clocking in
  twice) are rejected.
- Live "Today's Hours" ring panel showing progress toward the HR-set daily
  target, plus break time.
- A full-screen clock view (uses the Fullscreen API) for a kiosk-style
  display.
- Personal clock customization — 5 clock face styles (Digital, Analog,
  Minimal, Flip Board, Neon) and 6 accent colors, saved per user.

## Project layout

```
server/   Express API + SQLite database (server/data/clockin.db)
client/   React app (design system in client/src/components/ui)
```

## Notes for production use

- `server/.env` holds `JWT_SECRET` and the default HR credentials — replace
  `JWT_SECRET` with a strong random value before deploying, and never commit
  `.env`.
- The SQLite file lives at `server/data/clockin.db`; back it up like any
  other database file.
- CORS is currently wide open (`cors()` with no options) for local
  development — restrict it to your real frontend origin before deploying.
