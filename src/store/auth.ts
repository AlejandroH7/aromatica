import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Mejora de Ivan: el store ya no guarda el JWT (vive en cookie httpOnly); solo datos de UI del usuario.
interface AuthState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "aromatica-auth",
      // Mejora de Ivan: solo se persisten id, name, email y role; un token viejo en localStorage se descarta.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
