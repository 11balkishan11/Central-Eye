import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types/auth"

interface AuthState {
  token: string | null
  tenantId: string | null
  user: User | null
  setAuth: (token: string, tenantId: string | null, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      user: null,
      setAuth: (token, tenantId, user) => set({ token, tenantId, user }),
      clearAuth: () => set({ token: null, tenantId: null, user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
)
