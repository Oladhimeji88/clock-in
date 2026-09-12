# ChronoTrack — client

React + TypeScript + Tailwind CSS frontend for the ChronoTrack time & attendance
system. Talks to the Express API in `../server` (see the root `README.md` for
how to run both together).

## Getting started

```bash
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:4000` (see `vite.config.ts`),
so the backend must be running too — from the project root, `npm run dev` starts
both at once.

## Structure

- `src/pages` — routed screens (`hr/*` for the HR console, `employee/*` for the
  employee dashboard)
- `src/components` — shared UI kit (`ui/`), the clock face variants
  (`clock/`), and page-specific pieces (`hr/`, `employee/`)
- `src/contexts/AppContext.tsx` — the single data layer: auth, employees,
  attendance, leave, and clock settings, all backed by the real API
- `src/api/client.ts` — typed fetch wrapper for the backend
