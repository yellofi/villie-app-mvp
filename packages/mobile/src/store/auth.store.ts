import { create } from 'zustand'
import type { UserType } from '@villie/shared'

interface AuthState {
  // 상태
  phone: string
  isAuthenticated: boolean
  userId: string | null
  userType: UserType | null
  isLoading: boolean
  error: string | null

  // 액션
  setPhone: (phone: string) => void
  setUserType: (type: UserType) => void
  // Supabase onAuthStateChange 연결 시 호출 — 세션 획득 후 isAuthenticated: true
  setAuthenticated: (userId: string) => void
  reset: () => void
}

const initialState = {
  phone: '',
  isAuthenticated: false,
  userId: null,
  userType: null,
  isLoading: false,
  error: null,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setPhone: (phone) => set({ phone }),
  setUserType: (userType) => set({ userType }),
  setAuthenticated: (userId) => set({ isAuthenticated: true, userId }),
  reset: () => set(initialState),
}))
