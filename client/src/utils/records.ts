import type { AttendanceRecord, DayStatus } from '../types';

/** Last 5 working-day records, oldest first — used for the weekly bar chart. */
export function weeklyMinutesFromRecords(
  records: AttendanceRecord[]
): {day: string;minutes: number;status: DayStatus;}[] {
  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const recent = records.slice(0, 5).reverse();
  return labels.map((day, i) => {
    const rec = recent[i];
    return { day, minutes: rec ? rec.totalMin : 0, status: rec ? rec.status : 'absent' };
  });
}
