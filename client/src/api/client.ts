import type {
  AccountStatus,
  AttendanceRecord,
  ClockSession,
  ClockSettings,
  Employee,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  TodayRecord } from
'../types';

const TOKEN_KEY = 'chronotrack_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);else
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][];
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

export interface NewEmployeeInput {
  name: string;
  email: string;
  password: string;
  department: string;
  jobTitle: string;
  expectedHours: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
  breakAllowanceMin: number;
  accountStatus: AccountStatus;
}

export interface EmployeePatch {
  name?: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  expectedHours?: number;
  workingDays?: string[];
  startTime?: string;
  endTime?: string;
  breakAllowanceMin?: number;
  accountStatus?: AccountStatus;
  password?: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
    request<{token: string;user: Employee;}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    me: () => request<Employee>('/auth/me')
  },
  employees: {
    list: () => request<Employee[]>('/employees'),
    create: (data: NewEmployeeInput) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, patch: EmployeePatch) =>
    request<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
  },
  attendance: {
    session: () => request<ClockSession>('/attendance/session'),
    clockIn: () => request<ClockSession>('/attendance/clock-in', { method: 'POST' }),
    clockOut: () => request<ClockSession>('/attendance/clock-out', { method: 'POST' }),
    breakStart: () => request<ClockSession>('/attendance/break/start', { method: 'POST' }),
    breakEnd: () => request<ClockSession>('/attendance/break/end', { method: 'POST' }),
    saveClockSettings: (settings: ClockSettings) =>
    request<{ok: boolean;}>('/attendance/clock-settings', { method: 'PUT', body: JSON.stringify(settings) }),
    today: () => request<TodayRecord[]>('/attendance/today'),
    records: (params: {employeeId?: string;from?: string;to?: string;} = {}) =>
    request<AttendanceRecord[]>(`/attendance/records${qs(params)}`),
    recordsMe: (params: {from?: string;to?: string;} = {}) =>
    request<AttendanceRecord[]>(`/attendance/records/me${qs(params)}`)
  },
  leave: {
    submit: (data: {type: LeaveType;startDate: string;endDate: string;reason: string;}) =>
    request<LeaveRequest>('/leave', { method: 'POST', body: JSON.stringify(data) }),
    mine: () => request<LeaveRequest[]>('/leave/me'),
    all: () => request<LeaveRequest[]>('/leave'),
    setStatus: (id: string, status: LeaveStatus) =>
    request<LeaveRequest>(`/leave/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
  },
  company: {
    get: () => request<{name: string;timezone: string;}>('/company'),
    update: (patch: {name?: string;timezone?: string;}) =>
    request<{name: string;timezone: string;}>('/company', { method: 'PUT', body: JSON.stringify(patch) })
  }
};
