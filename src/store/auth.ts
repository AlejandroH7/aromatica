import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: SessionUser | null;
  setAuth: (user: SessionUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "aromatica-auth" },
  ),
);
