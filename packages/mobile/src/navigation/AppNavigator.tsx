import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '../store/auth.store'
import type { AuthStackParamList } from './types'
import { PhoneInputScreen } from '../screens/auth/PhoneInputScreen'
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen'
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen'

// Placeholder for main tab navigator (Phase 2)
import { View, Text } from 'react-native'
function MainPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">메인 앱 (준비 중)</Text>
    </View>
  )
}

const AuthStack = createNativeStackNavigator<AuthStackParamList>()

export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <MainPlaceholder />

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <AuthStack.Screen name="RoleSelect" component={RoleSelectScreen} />
    </AuthStack.Navigator>
  )
}
