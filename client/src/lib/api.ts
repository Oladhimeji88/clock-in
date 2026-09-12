import axios from "axios";
import { useAuthStore } from "./auth-store";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export interface ClockStyle {
  face: "digital" | "analog" | "minimal" | "flip" | "neon";
  accent: "indigo" | "emerald" | "rose" | "amber" | "sky" | "violet";
  theme: "dark" | "light";
}

export type AttendanceStatus = "clocked_out" | "working" | "on_break" | "on_leave";

export interface StatusResponse {
  status: AttendanceStatus;
  workedSeconds: number;
  breakSeconds: number;
  targetHours: number;
  firstClockIn: number | null;
  clockStyle: ClockStyle;
  serverTime: number;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  targetHours: number;
  clockStyle: ClockStyle;
  active: boolean;
  createdAt: string;
  status: AttendanceStatus;
  workedHoursToday: number;
  breakHoursToday: number;
}
