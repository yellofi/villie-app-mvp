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
  reset: () => set(initialState),
}))
