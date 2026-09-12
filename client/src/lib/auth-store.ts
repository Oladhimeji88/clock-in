import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClockStyle } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "hr" | "employee";
  targetHours: number;
  clockStyle: ClockStyle;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
    }),
    { name: "clockin-auth" }
  )
);
