import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ClockSession,
  ClockSettings,
  Employee,
  LeaveRequest,
  LeaveStatus,
  Role,
  TodayRecord } from
'../types';
import { api, ApiError, getToken, setToken, type CompanySettings, type NewEmployeeInput } from '../api/client';

interface LoginResult {
  ok: boolean;
  role?: Role;
  message?: string;
}

interface AppState {
  authReady: boolean;
  company: CompanySettings;
  currentUser: Employee | null;
  employees: Employee[];
  employeeById: Record<string, Employee>;
  departments: string[];
  today: TodayRecord[];
  leave: LeaveRequest[];
  session: ClockSession;
  clockSettings: ClockSettings;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  addEmployee: (input: NewEmployeeInput) => Promise<Employee>;
  updateEmployee: (id: string, patch: Partial<Employee> & {password?: string;}) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  setLeaveStatus: (id: string, status: LeaveStatus) => Promise<void>;
  submitLeave: (input: {type: LeaveRequest['type'];startDate: string;endDate: string;reason: string;}) => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  resetDay: () => Promise<void>;
  saveClockSettings: (settings: ClockSettings) => Promise<void>;
  updateCompany: (patch: Partial<CompanySettings>) => Promise<void>;
  updateAvatar: (dataUrl: string | null) => Promise<void>;
}

const EMPTY_SESSION: ClockSession = { status: 'not_in', clockInAt: null, clockOutAt: null, breaks: [] };
const DEFAULT_COMPANY: CompanySettings = { name: 'Your Company', timezone: 'GMT+0 · London', autoClockoutHours: null };

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: {children: React.ReactNode;}) {
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [today, setToday] = useState<TodayRecord[]>([]);
  const [leave, setLeave] = useState<LeaveRequest[]>([]);
  const [session, setSession] = useState<ClockSession>(EMPTY_SESSION);
  const [clockSettings, setClockSettings] = useState<ClockSettings>({
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
  });

  // Restore session from a stored token on first load.
  useEffect(() => {
    (async () => {
      api.company.get().then(setCompany).catch(() => undefined);
      const token = getToken();
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        const user = await api.auth.me();
        setCurrentUser(user);
        setClockSettings(user.clockSettings);
      } catch {
        setToken(null);
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  const employeeById = useMemo(() => {
    const map: Record<string, Employee> = {};
    if (currentUser) map[currentUser.id] = currentUser;
    employees.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [employees, currentUser]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.department && set.add(e.department));
    return Array.from(set).sort();
  }, [employees]);

  // Polling refetches can race with a user action (e.g. an in-flight GET /leave
  // resolving just after an Approve click resolves and overwrites it). Every
  // mutation below bumps this counter; a poll response only applies if no
  // mutation happened after it was fired, so it never clobbers fresher state.
  const mutationVersion = useRef(0);

  // Role-specific polling: HR watches the live roster, employees watch their own session.
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    if (!currentUser) return;

    if (currentUser.role === 'hr') {
      const load = () => {
        const startVersion = mutationVersion.current;
        const applyIfFresh = <T,>(setter: (v: T) => void) => (v: T) => {
          if (mutationVersion.current === startVersion) setter(v);
        };
        api.employees.list().then(applyIfFresh(setEmployees)).catch(() => undefined);
        api.attendance.today().then(applyIfFresh(setToday)).catch(() => undefined);
        api.leave.all().then(applyIfFresh(setLeave)).catch(() => undefined);
      };
      load();
      pollRef.current = window.setInterval(load, 15000);
    } else {
      const load = () => {
        const startVersion = mutationVersion.current;
        api.attendance.session().then((v) => {
          if (mutationVersion.current === startVersion) setSession(v);
        }).catch(() => undefined);
      };
      load();
      api.leave.mine().then(setLeave).catch(() => undefined);
      pollRef.current = window.setInterval(load, 20000);
    }

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [currentUser?.id, currentUser?.role]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { token, user } = await api.auth.login(email, password);
      setToken(token);
      setCurrentUser(user);
      setClockSettings(user.clockSettings);
      return { ok: true, role: user.role };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to sign in.';
      return { ok: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setEmployees([]);
    setToday([]);
    setLeave([]);
    setSession(EMPTY_SESSION);
  }, []);

  const addEmployee = useCallback(async (input: NewEmployeeInput) => {
    const created = await api.employees.create(input);
    mutationVersion.current++;
    // HR accounts created here don't show in the employee directory.
    if (created.role === 'employee') {
      setEmployees((prev) => [created, ...prev]);
    }
    return created;
  }, []);

  const updateEmployee = useCallback(
    async (id: string, patch: Partial<Employee> & {password?: string;}) => {
      const updated = await api.employees.update(id, patch);
      mutationVersion.current++;
      setEmployees((prev) => prev.map((e) => e.id === id ? updated : e));
      setCurrentUser((prev) => prev && prev.id === id ? updated : prev);
    },
    []
  );

  const deleteEmployee = useCallback(async (id: string) => {
    await api.employees.remove(id);
    mutationVersion.current++;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setLeaveStatus = useCallback(async (id: string, status: LeaveStatus) => {
    const updated = await api.leave.setStatus(id, status);
    mutationVersion.current++;
    setLeave((prev) => prev.map((l) => l.id === id ? updated : l));
  }, []);

  const submitLeave = useCallback(
    async (input: {type: LeaveRequest['type'];startDate: string;endDate: string;reason: string;}) => {
      const created = await api.leave.submit(input);
      mutationVersion.current++;
      setLeave((prev) => [created, ...prev]);
    },
    []
  );

  const clockIn = useCallback(async () => {
    const next = await api.attendance.clockIn();
    mutationVersion.current++;
    setSession(next);
  }, []);
  const clockOut = useCallback(async () => {
    const next = await api.attendance.clockOut();
    mutationVersion.current++;
    setSession(next);
  }, []);
  const startBreak = useCallback(async () => {
    const next = await api.attendance.breakStart();
    mutationVersion.current++;
    setSession(next);
  }, []);
  const endBreak = useCallback(async () => {
    const next = await api.attendance.breakEnd();
    mutationVersion.current++;
    setSession(next);
  }, []);
  // Clocking back in after a completed workday just starts a fresh session.
  const resetDay = clockIn;

  const saveClockSettings = useCallback(async (settings: ClockSettings) => {
    await api.attendance.saveClockSettings(settings);
    mutationVersion.current++;
    setClockSettings(settings);
    setCurrentUser((prev) => prev ? { ...prev, clockSettings: settings } : prev);
  }, []);

  const updateCompany = useCallback(async (patch: Partial<CompanySettings>) => {
    const updated = await api.company.update(patch);
    setCompany(updated);
  }, []);

  const updateAvatar = useCallback(async (dataUrl: string | null) => {
    const updated = dataUrl ? await api.auth.uploadAvatar(dataUrl) : await api.auth.removeAvatar();
    setCurrentUser(updated);
  }, []);

  const value: AppState = {
    authReady,
    company,
    currentUser,
    employees,
    employeeById,
    departments,
    today,
    leave,
    session,
    clockSettings,
    login,
    logout,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setLeaveStatus,
    submitLeave,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    resetDay,
    saveClockSettings,
    updateCompany,
    updateAvatar
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
