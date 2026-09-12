export type Role = 'hr' | 'employee';

export type DayStatus = 'working' | 'break' | 'out' | 'leave' | 'late' | 'absent' | 'not_in';

export type AccountStatus = 'active' | 'disabled' | 'invited';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  role: Role;
  expectedHours: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
  breakAllowanceMin: number;
  accountStatus: AccountStatus;
  initials: string;
  tone: string;
  lastClockIn: string;
}

export interface TodayRecord {
  employeeId: string;
  status: DayStatus;
  clockIn: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  clockOut: string | null;
  workedMin: number;
  expectedMin: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  clockOut: string | null;
  totalMin: number;
  expectedMin: number;
  status: DayStatus;
}

export type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
  submittedAt: string;
}

export type SessionStatus = 'not_in' | 'working' | 'break' | 'out' | 'leave';

export interface BreakSpan {
  start: number;
  end: number | null;
}

export interface ClockSession {
  status: SessionStatus;
  clockInAt: number | null;
  clockOutAt: number | null;
  breaks: BreakSpan[];
}

export type ClockStyle = 'digital' | 'segmented' | 'minimal' | 'modern' | 'retro';
export type ClockTheme = 'dark' | 'light' | 'minimal' | 'glass' | 'retro';

export interface ClockSettings {
  style: ClockStyle;
  theme: ClockTheme;
  hour12: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showDay: boolean;
  showStatus: boolean;
  showWorked: boolean;
  showRemaining: boolean;
  showProgress: boolean;
}