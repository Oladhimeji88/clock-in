import type { AttendanceRecord, DayStatus } from '../types';
import { employees } from './employees';
import { isoDate } from '../utils/time';

/** Deterministic pseudo-random so the prototype data is stable across renders. */
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function toLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const disp = h % 12 === 0 ? 12 : h % 12;
  return `${String(disp).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

function buildHistory(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  employees.forEach((emp, empIndex) => {
    const [sh, sm] = emp.startTime.split(':').map(Number);
    const plannedStart = sh * 60 + sm;
    const expectedMin = Math.round(emp.expectedHours * 60);

    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;

      const r = seeded((empIndex + 2) * 31 + dayOffset * 7);
      const r2 = seeded((empIndex + 5) * 17 + dayOffset * 13);

      let status: DayStatus = 'out';
      if (r > 0.93) status = 'leave';else
      if (r > 0.86) status = 'late';

      if (status === 'leave') {
        records.push({
          id: `${emp.id}-${dayOffset}`,
          employeeId: emp.id,
          date: isoDate(date),
          clockIn: null,
          breakStart: null,
          breakEnd: null,
          clockOut: null,
          totalMin: 0,
          expectedMin,
          status: 'leave'
        });
        continue;
      }

      const drift = status === 'late' ? 18 + Math.round(r2 * 22) : Math.round((r2 - 0.55) * 16);
      const clockInMin = plannedStart + drift;
      const breakLen = 28 + Math.round(r2 * 26);
      const breakStartMin = clockInMin + 200 + Math.round(r * 40);
      const workedMin = expectedMin + Math.round((r2 - 0.5) * 64);
      const clockOutMin = clockInMin + workedMin + breakLen;

      records.push({
        id: `${emp.id}-${dayOffset}`,
        employeeId: emp.id,
        date: isoDate(date),
        clockIn: toLabel(clockInMin),
        breakStart: toLabel(breakStartMin),
        breakEnd: toLabel(breakStartMin + breakLen),
        clockOut: toLabel(clockOutMin),
        totalMin: workedMin,
        expectedMin,
        status
      });
    }
  });

  return records.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
}

export const attendanceHistory: AttendanceRecord[] = buildHistory();

export function recordsForEmployee(employeeId: string): AttendanceRecord[] {
  return attendanceHistory.filter((r) => r.employeeId === employeeId);
}

/** Last 5 weekdays of worked minutes, oldest first — used for the weekly bar chart. */
export function weeklyMinutes(employeeId: string): {day: string;minutes: number;status: DayStatus;}[] {
  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const recent = recordsForEmployee(employeeId).slice(0, 5).reverse();
  return labels.map((day, i) => {
    const rec = recent[i];
    return { day, minutes: rec ? rec.totalMin : 0, status: rec ? rec.status : 'absent' };
  });
}