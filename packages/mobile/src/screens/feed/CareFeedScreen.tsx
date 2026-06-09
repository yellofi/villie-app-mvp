import React from 'react'
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import type { CareRequest } from '@villie/shared'
import type { FeedStackParamList } from '../../navigation/types'
import { CareRequestCard } from '../../components/feed/CareRequestCard'
import { getFeed } from '../../services/care.service'
import { useAuthStore } from '../../store/auth.store'

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'CareFeed'>

// TODO(TD-03): 실제 GPS 인증 후 user_locations에서 읽어온 동네명으로 교체
const MOCK_DONG = '서초4동'

export function CareFeedScreen() {
  const navigation = useNavigation<NavProp>()
  const userType = useAuthStore((s) => s.userType)

  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<CareRequest[]>({
    queryKey: ['care-feed'],
    queryFn: () => getFeed(), // TD-03 후 getFeed({ lat, lng }) 로 교체
  })

  const handleCardPress = (request: CareRequest) => {
    navigation.navigate('CareDetail', { requestId: request.id })
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator testID="loading-indicator" color="#f97316" />
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-gray-500 text-center mb-4">
          피드를 불러오지 못했어요
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-orange-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 — 모크업 스타일 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-base font-bold text-gray-900">{MOCK_DONG}</Text>
          <Text className="text-gray-400 text-xs">▾</Text>
        </View>
        <View className="flex-row gap-5">
          <Text className="text-lg text-gray-500">🔍</Text>
          <Text className="text-lg text-gray-500">🔔</Text>
        </View>
      </View>

      {/* 피드 목록 */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CareRequestCard request={item} onPress={handleCardPress} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={requests.length === 0 ? { flex: 1 } : { paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#f97316"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="text-gray-500 text-base font-medium">
              주변에 돌봄 요청이 없어요
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              나중에 다시 확인해보세요
            </Text>
          </View>
        }
      />

      {/* FAB — PARENT만 표시 */}
      {userType === 'PARENT' && (
        <TouchableOpacity
          testID="fab-button"
          onPress={() => navigation.getParent()?.navigate('PostTab')}
          className="absolute bottom-6 right-4 w-12 h-12 bg-orange-500 rounded-full shadow-lg items-center justify-center"
        >
          <Text className="text-white text-xl">✏️</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}
