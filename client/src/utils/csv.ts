import type { AttendanceRecord, Employee } from '../types';
import { formatClockHours } from './time';

const HEADERS = [
'Employee Name',
'Email',
'Date',
'Clock In',
'Break Start',
'Break End',
'Clock Out',
'Total Hours',
'Expected Hours',
'Status'];


const STATUS_LABEL: Record<string, string> = {
  working: 'Working',
  break: 'On Break',
  out: 'Clocked Out',
  leave: 'On Leave',
  late: 'Late',
  absent: 'Absent',
  not_in: 'Not Clocked In'
};

function escape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildCsv(records: AttendanceRecord[], employeeById: Record<string, Employee>): string {
  const rows = records.map((r) => {
    const emp = employeeById[r.employeeId];
    return [
    emp?.name ?? 'Unknown',
    emp?.email ?? '',
    r.date,
    r.clockIn ?? '',
    r.breakStart ?? '',
    r.breakEnd ?? '',
    r.clockOut ?? '',
    formatClockHours(r.totalMin),
    formatClockHours(r.expectedMin),
    STATUS_LABEL[r.status] ?? r.status].
    map((cell) => escape(String(cell)));
  });
  return [HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadCsv(fileName: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const csvColumns = HEADERS;
export const statusLabel = STATUS_LABEL;