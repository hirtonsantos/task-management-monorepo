import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { authService } from "../api/auth.service"

const isBrowser =
  typeof globalThis !== "undefined" && typeof (globalThis as any).window !== "undefined"

const browserStorage = {
  getItem: (name: string) => {
    if (!isBrowser) return null
    return (globalThis as any).localStorage.getItem(name)
  },
  setItem: (name: string, value: string) => {
    if (!isBrowser) return
    ;(globalThis as any).localStorage.setItem(name, value)
  },
  removeItem: (name: string) => {
    if (!isBrowser) return
    ;(globalThis as any).localStorage.removeItem(name)
  },
}

// Define the Auth types used by the store
export type AuthUser = any

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // 🔑 hydration flag
  _hasHydrated: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // 🔒 começa falso no server e no client
      _hasHydrated: false,

      login: async (email, password) => {
        const { data } = await authService.login({ email, password })

        browserStorage.setItem("accessToken", data.data.accessToken)
        browserStorage.setItem("refreshToken", data.data.refreshToken)

        set({
          user: data.data.user,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        browserStorage.removeItem("accessToken")
        browserStorage.removeItem("refreshToken")

        set({
          user: null,
          isAuthenticated: false,
        })
      },

      checkAuth: async () => {
        set({ isLoading: true })

        try {
          const token = browserStorage.getItem("accessToken")

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
            return
          }

          const { data } = await authService.me()

          set({
            user: data.data,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          browserStorage.removeItem("accessToken")
          browserStorage.removeItem("refreshToken")

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => browserStorage),

      // 🚫 NÃO persistir hydration flag
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      // ✅ marca quando o storage terminou de hidratar
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hasHydrated: true })
      },
    },
  ),
)
