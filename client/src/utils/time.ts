import type { BreakSpan, ClockSession } from '../types';

const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');

export function formatTimeOfDay(date: Date, hour12: boolean, showSeconds: boolean): string {
  let h = date.getHours();
  if (hour12) {
    h = h % 12;
    if (h === 0) h = 12;
  }
  const base = `${hour12 ? String(h).padStart(2, '0') : pad(h)}:${pad(date.getMinutes())}`;
  return showSeconds ? `${base}:${pad(date.getSeconds())}` : base;
}

export function meridiem(date: Date): string {
  return date.getHours() >= 12 ? 'PM' : 'AM';
}

/** 01:42:18 */
export function formatDurationHMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(total / 3600)}:${pad(total % 3600 / 60)}:${pad(total % 60)}`;
}

/** 8h 02m */
export function formatHm(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  return `${h}h ${pad(m % 60)}m`;
}

/** 04:12 */
export function formatClockHours(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${pad(m / 60)}:${pad(m % 60)}`;
}

/** +00:12 / -00:34 */
export function formatDifference(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const m = Math.abs(Math.round(minutes));
  return `${sign}${pad(m / 60)}:${pad(m % 60)}`;
}

export function breakMs(breaks: BreakSpan[], now: number): number {
  return breaks.reduce((sum, b) => sum + ((b.end ?? now) - b.start), 0);
}

export interface SessionTotals {
  workedMs: number;
  breakMs: number;
  remainingMs: number;
  progress: number;
  activeBreakMs: number;
}

export function sessionTotals(session: ClockSession, now: number, expectedHours: number): SessionTotals {
  const expectedMs = expectedHours * 3600_000;
  if (!session.clockInAt) {
    return { workedMs: 0, breakMs: 0, remainingMs: expectedMs, progress: 0, activeBreakMs: 0 };
  }
  const end = session.clockOutAt ?? now;
  const bMs = breakMs(session.breaks, end);
  const workedMs = Math.max(0, end - session.clockInAt - bMs);
  const open = session.breaks.find((b) => b.end === null);
  return {
    workedMs,
    breakMs: bMs,
    remainingMs: Math.max(0, expectedMs - workedMs),
    progress: expectedMs ? Math.min(1, workedMs / expectedMs) : 0,
    activeBreakMs: open ? now - open.start : 0
  };
}

export function stampToLabel(ts: number | null, hour12 = true): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${formatTimeOfDay(d, hour12, false)} ${hour12 ? meridiem(d) : ''}`.trim();
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
'January',
'February',
'March',
'April',
'May',
'June',
'July',
'August',
'September',
'October',
'November',
'December'];


export function longDate(date: Date): string {
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function dayName(date: Date, short = false): string {
  const d = DAYS[date.getDay()];
  return short ? d.slice(0, 3).toUpperCase() : d;
}

export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${d}, ${y}`;
}

export function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function addHoursToTime(time: string, hours: number, breakMinutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + hours * 60 + breakMinutes;
  const hh = Math.floor(total / 60 % 24);
  const mm = total % 60;
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const disp = hh % 12 === 0 ? 12 : hh % 12;
  return `${pad(disp)}:${pad(mm)} ${suffix}`;
}