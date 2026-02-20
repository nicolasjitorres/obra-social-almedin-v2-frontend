import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null })
        localStorage.removeItem("almedin-auth")
        sessionStorage.clear()
        fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {})
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: "almedin-auth" },
  ),
);