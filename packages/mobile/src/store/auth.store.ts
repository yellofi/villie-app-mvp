import { create } from 'zustand'
import type { UserType } from '@villie/shared'

interface AuthState {
  // 상태
  phone: string
  nickname: string
  isAuthenticated: boolean
  userId: string | null
  userType: UserType | null
  isLoading: boolean
  error: string | null

  // 액션
  setPhone: (phone: string) => void
  setNickname: (nickname: string) => void
  setUserType: (type: UserType) => void
  /** Supabase 세션 획득 후 호출. userType은 재방문 유저 복원 시 DB에서 가져온 값 사용 */
  setAuthenticated: (userId: string, userType?: UserType) => void
  reset: () => void
}

const initialState = {
  phone: '',
  nickname: '',
  isAuthenticated: false,
  userId: null,
  userType: null,
  isLoading: false,
  error: null,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setPhone: (phone) => set({ phone }),
  setNickname: (nickname) => set({ nickname }),
  setUserType: (userType) => set({ userType }),
  setAuthenticated: (userId, userType) =>
    set((s) => ({
      isAuthenticated: true,
      userId,
      userType: userType ?? s.userType,
    })),
  reset: () => set(initialState),
}))
