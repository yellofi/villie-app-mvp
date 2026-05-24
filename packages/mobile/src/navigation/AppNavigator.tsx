import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '../store/auth.store'
import type { AuthStackParamList } from './types'
import { PhoneInputScreen } from '../screens/auth/PhoneInputScreen'
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen'
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen'
import { LocationVerifyScreen } from '../screens/auth/LocationVerifyScreen'

import { MainNavigator } from './MainNavigator'

const AuthStack = createNativeStackNavigator<AuthStackParamList>()

export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <MainNavigator />

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <AuthStack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <AuthStack.Screen name="LocationVerify" component={LocationVerifyScreen} />
    </AuthStack.Navigator>
  )
}
