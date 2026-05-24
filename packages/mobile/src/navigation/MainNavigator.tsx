import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import type { MainTabParamList } from './types'
import { CareFeedScreen } from '../screens/feed/CareFeedScreen'

// Phase 1 placeholders — 추후 실제 화면으로 교체
import { View } from 'react-native'
function Placeholder({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400 text-base">{label} (준비 중)</Text>
    </View>
  )
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#10b981',   // emerald-500
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        tabBarStyle: { borderTopColor: '#f3f4f6' },
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            Feed: '피드',
            NearSeniors: '주변 시터',
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
            Feed: '🏠',
            NearSeniors: '👴',
            Chat: '💬',
            MyVillie: '👤',
          }
          return <Text style={{ fontSize: 20 }}>{icons[route.name] ?? '•'}</Text>
        },
      })}
    >
      <Tab.Screen name="Feed" component={CareFeedScreen} />
      <Tab.Screen name="NearSeniors" children={() => <Placeholder label="주변 시터" />} />
      <Tab.Screen name="Chat" children={() => <Placeholder label="채팅" />} />
      <Tab.Screen name="MyVillie" children={() => <Placeholder label="내 빌리" />} />
    </Tab.Navigator>
  )
}
