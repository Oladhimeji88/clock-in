import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
  ClockSession,
  ClockSettings,
  Employee,
  LeaveRequest,
  LeaveStatus,
  Role,
  TodayRecord } from
'../types';
import { COMPANY, employees as seedEmployees, hrUser, todayRecords as seedToday } from '../data/employees';
import { leaveRequests as seedLeave } from '../data/leave';

interface LoginResult {
  ok: boolean;
  role?: Role;
  message?: string;
}

interface AppState {
  company: typeof COMPANY;
  currentUser: Employee | null;
  employees: Employee[];
  employeeById: Record<string, Employee>;
  today: TodayRecord[];
  leave: LeaveRequest[];
  session: ClockSession;
  clockSettings: ClockSettings;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  addEmployee: (input: Omit<Employee, 'id' | 'initials' | 'tone' | 'lastClockIn' | 'role'>) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  setLeaveStatus: (id: string, status: LeaveStatus) => void;
  submitLeave: (input: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'submittedAt' | 'days'>) => void;
  clockIn: () => void;
  clockOut: () => void;
  startBreak: () => void;
  endBreak: () => void;
  resetDay: () => void;
  saveClockSettings: (settings: ClockSettings) => void;
}

const DEFAULT_SETTINGS: ClockSettings = {
  style: 'segmented',
  theme: 'dark',
  hour12: false,
  showSeconds: true,
  showDate: true,
  showDay: true,
  showStatus: true,
  showWorked: true,
  showRemaining: true,
  showProgress: true
};

const EMPTY_SESSION: ClockSession = { status: 'not_in', clockInAt: null, clockOutAt: null, breaks: [] };

const TONES = [
'bg-accent-100 text-accent-700',
'bg-emerald-100 text-emerald-700',
'bg-sky-100 text-sky-700',
'bg-amber-100 text-amber-700',
'bg-rose-100 text-rose-700',
'bg-violet-100 text-violet-700'];


const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: {children: React.ReactNode;}) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees);
  const [today, setToday] = useState<TodayRecord[]>(seedToday);
  const [leave, setLeave] = useState<LeaveRequest[]>(seedLeave);
  const [session, setSession] = useState<ClockSession>(EMPTY_SESSION);
  const [clockSettings, setClockSettings] = useState<ClockSettings>(DEFAULT_SETTINGS);

  const employeeById = useMemo(() => {
    const map: Record<string, Employee> = { [hrUser.id]: hrUser };
    employees.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [employees]);

  const login = useCallback(
    (email: string, password: string): LoginResult => {
      const normalized = email.trim().toLowerCase();
      if (password.trim().length < 4) {
        return { ok: false, message: 'Password must be at least 4 characters.' };
      }
      if (normalized === hrUser.email) {
        setCurrentUser(hrUser);
        return { ok: true, role: 'hr' };
      }
      const match = employees.find((e) => e.email.toLowerCase() === normalized);
      if (!match) return { ok: false, message: 'No account found for that email address.' };
      if (match.accountStatus === 'disabled') {
        return { ok: false, message: 'This account has been disabled. Contact People Operations.' };
      }
      setCurrentUser(match);
      return { ok: true, role: 'employee' };
    },
    [employees]
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  const addEmployee: AppState['addEmployee'] = useCallback((input) => {
    const initials = input.name.
    split(' ').
    filter(Boolean).
    slice(0, 2).
    map((p) => p[0]?.toUpperCase() ?? '').
    join('');
    const created: Employee = {
      ...input,
      id: `e-${Math.random().toString(36).slice(2, 8)}`,
      role: 'employee',
      initials: initials || 'NE',
      tone: TONES[Math.floor(Math.random() * TONES.length)],
      lastClockIn: '—'
    };
    setEmployees((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateEmployee: AppState['updateEmployee'] = useCallback((id, patch) => {
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e));
    setCurrentUser((prev) => prev && prev.id === id ? { ...prev, ...patch } : prev);
  }, []);

  const setLeaveStatus: AppState['setLeaveStatus'] = useCallback((id, status) => {
    setLeave((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  }, []);

  const submitLeave: AppState['submitLeave'] = useCallback(
    (input) => {
      if (!currentUser) return;
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
      setLeave((prev) => [
      {
        ...input,
        id: `lv-${Math.random().toString(36).slice(2, 7)}`,
        employeeId: currentUser.id,
        status: 'Pending',
        submittedAt: new Date().toISOString().slice(0, 10),
        days
      },
      ...prev]
      );
    },
    [currentUser]
  );

  const syncToday = useCallback(
    (next: ClockSession, employeeId: string) => {
      setToday((prev) => {
        const others = prev.filter((r) => r.employeeId !== employeeId);
        const existing = prev.find((r) => r.employeeId === employeeId);
        const emp = employeeById[employeeId];
        const openBreak = next.breaks.find((b) => b.end === null);
        const fmt = (ts: number | null) =>
        ts ?
        new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) :
        null;
        const record: TodayRecord = {
          employeeId,
          status: next.status === 'not_in' ? 'not_in' : next.status,
          clockIn: fmt(next.clockInAt),
          breakStart: next.breaks.length ? fmt(next.breaks[next.breaks.length - 1].start) : null,
          breakEnd: openBreak ? null : next.breaks.length ? fmt(next.breaks[next.breaks.length - 1].end) : null,
          clockOut: fmt(next.clockOutAt),
          workedMin: existing?.workedMin ?? 0,
          expectedMin: Math.round((emp?.expectedHours ?? 8) * 60)
        };
        return [record, ...others];
      });
    },
    [employeeById]
  );

  const mutateSession = useCallback(
    (fn: (s: ClockSession) => ClockSession) => {
      setSession((prev) => {
        const next = fn(prev);
        if (currentUser) syncToday(next, currentUser.id);
        return next;
      });
    },
    [currentUser, syncToday]
  );

  const clockIn = useCallback(() => {
    mutateSession(() => ({ status: 'working', clockInAt: Date.now(), clockOutAt: null, breaks: [] }));
  }, [mutateSession]);

  const clockOut = useCallback(() => {
    mutateSession((prev) => {
      const now = Date.now();
      return {
        ...prev,
        status: 'out',
        clockOutAt: now,
        breaks: prev.breaks.map((b) => b.end === null ? { ...b, end: now } : b)
      };
    });
  }, [mutateSession]);

  const startBreak = useCallback(() => {
    mutateSession((prev) =>
    prev.status !== 'working' ?
    prev :
    { ...prev, status: 'break', breaks: [...prev.breaks, { start: Date.now(), end: null }] }
    );
  }, [mutateSession]);

  const endBreak = useCallback(() => {
    mutateSession((prev) =>
    prev.status !== 'break' ?
    prev :
    {
      ...prev,
      status: 'working',
      breaks: prev.breaks.map((b) => b.end === null ? { ...b, end: Date.now() } : b)
    }
    );
  }, [mutateSession]);

  const resetDay = useCallback(() => {
    mutateSession(() => EMPTY_SESSION);
  }, [mutateSession]);

  const saveClockSettings = useCallback((settings: ClockSettings) => setClockSettings(settings), []);

  const value: AppState = {
    company: COMPANY,
    currentUser,
    employees,
    employeeById,
    today,
    leave,
    session,
    clockSettings,
    login,
    logout,
    addEmployee,
    updateEmployee,
    setLeaveStatus,
    submitLeave,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    resetDay,
    saveClockSettings
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}