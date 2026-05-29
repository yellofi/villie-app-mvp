import './global.css'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { AppNavigator } from './src/navigation/AppNavigator'
import { supabase } from './src/lib/supabase'
import { useAuthStore } from './src/store/auth.store'

export default function App() {
  const { setAuthenticated, reset } = useAuthStore()

  useEffect(() => {
    // 앱 시작 시 기존 세션 복원 (재방문 유저)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // TODO(TD-04): users 테이블 조회로 온보딩 완료 여부 확인 예정
        // 현재: 세션 있으면 바로 인증 처리
        setAuthenticated(session.user.id)
      }
    })

    // 로그아웃 처리만 구독 (로그인은 화면 플로우에서 직접 처리)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') reset()
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}
