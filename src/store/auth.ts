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
  token: string | null;
  setAuth: (user: SessionUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "aromatica-auth" },
  ),
);
