import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { FeedStackParamList } from './types'
import { CareFeedScreen } from '../screens/feed/CareFeedScreen'
import { CareDetailScreen } from '../screens/feed/CareDetailScreen'

const Stack = createNativeStackNavigator<FeedStackParamList>()

export function FeedStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CareFeed" component={CareFeedScreen} />
      <Stack.Screen name="CareDetail" component={CareDetailScreen} />
    </Stack.Navigator>
  )
}
