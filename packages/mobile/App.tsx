import './global.css'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppNavigator } from './src/navigation/AppNavigator'
import { supabase } from './src/lib/supabase'
import { useAuthStore } from './src/store/auth.store'
import { getUser } from './src/services/user.service'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30, // 30초 캐시
    },
  },
})

export default function App() {
  const { setAuthenticated, reset } = useAuthStore()

  useEffect(() => {
    // ─── 세션 복원 (앱 재시작) ───────────────────────────────────
    // TD-04 해결: users 테이블 조회로 온보딩 완료 여부 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      try {
        const user = await getUser(session.user.id)
        if (user) {
          // 재방문 유저: DB에 프로필 있음 → 피드로 바로 진입
          setAuthenticated(session.user.id, user.user_type)
        }
        // 신규 유저: DB에 프로필 없음 → 온보딩 유지 (아무것도 안 함)
      } catch {
        // 네트워크 오류 → 온보딩으로 fallback
      }
    })

    // ─── 로그아웃 처리 ──────────────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear()
        reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  )
}
