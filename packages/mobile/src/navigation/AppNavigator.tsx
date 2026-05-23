import React from 'react'
import { View, Text } from 'react-native'
import { useAuthStore } from '../store/auth.store'

// TODO: 실제 네비게이션 라이브러리 설치 후 교체
export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Auth Flow (준비 중)</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Main App (준비 중)</Text>
    </View>
  )
}
