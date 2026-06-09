import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { FeedStackParamList } from './types'
import { CareFeedScreen } from '../screens/feed/CareFeedScreen'
import { CareDetailScreen } from '../screens/feed/CareDetailScreen'
import { SeniorProfileScreen } from '../screens/profile/SeniorProfileScreen'
import { ReviewScreen } from '../screens/review/ReviewScreen'

const Stack = createNativeStackNavigator<FeedStackParamList>()

export function FeedStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CareFeed" component={CareFeedScreen} />
      <Stack.Screen name="CareDetail" component={CareDetailScreen} />
      <Stack.Screen name="SeniorProfile" component={SeniorProfileScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  )
}
