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

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'CareFeed'>

export function CareFeedScreen() {
  const navigation = useNavigation<NavProp>()

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
        <ActivityIndicator testID="loading-indicator" color="#10b981" />
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
          className="bg-emerald-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">빌리 피드</Text>
        <Text className="text-sm text-gray-500 mt-0.5">내 주변 돌봄 요청</Text>
      </View>

      {/* 피드 목록 */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CareRequestCard request={item} onPress={handleCardPress} />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#10b981"
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
    </SafeAreaView>
  )
}
