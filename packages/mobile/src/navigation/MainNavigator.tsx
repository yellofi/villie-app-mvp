import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import type { MainTabParamList } from './types'
import { FeedStackNavigator } from './FeedStackNavigator'
import { CarePostScreen } from '../screens/post/CarePostScreen'
import { useAuthStore } from '../store/auth.store'

// Placeholder 화면 — 추후 실제 화면으로 교체
function Placeholder({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400 text-base">{label} (준비 중)</Text>
    </View>
  )
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainNavigator() {
  const userType = useAuthStore((s) => s.userType)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#f97316',   // orange-500
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        tabBarStyle: { borderTopColor: '#f3f4f6' },
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            FeedTab: '피드',
            PostTab: userType === 'PARENT' ? '요청 작성' : '지원 현황',
            Chat: '채팅',
            MyVillie: '내 빌리',
          }
          return (
            <Text style={{ color, fontSize: 10, marginBottom: 2 }}>
              {labels[route.name] ?? route.name}
            </Text>
          )
        },
        tabBarIcon: ({ color }) => {
          const icons: Record<string, string> = {
            FeedTab: '🏠',
            PostTab: userType === 'PARENT' ? '✏️' : '📋',
            Chat: '💬',
            MyVillie: '👤',
          }
          return <Text style={{ fontSize: 20 }}>{icons[route.name] ?? '•'}</Text>
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedStackNavigator} />
      <Tab.Screen
        name="PostTab"
        children={() =>
          userType === 'PARENT' ? (
            <CarePostScreen />
          ) : (
            <Placeholder label="지원 현황" />
          )
        }
      />
      <Tab.Screen name="Chat" children={() => <Placeholder label="채팅" />} />
      <Tab.Screen name="MyVillie" children={() => <Placeholder label="내 빌리" />} />
    </Tab.Navigator>
  )
}
