import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import type { FeedStackParamList } from '../../navigation/types'
import { getSeniorProfile } from '../../services/senior.service'
import type { SeniorProfile } from '../../services/senior.service'

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'SeniorProfile'>
type RouteP = RouteProp<FeedStackParamList, 'SeniorProfile'>

const AGE_CONFIG = [
  { key: 'INFANT',     label: '영유아',  sublabel: '0~3세',  icon: '👶' },
  { key: 'TODDLER',    label: '유아',    sublabel: '4~7세',  icon: '🧒' },
  { key: 'ELEMENTARY', label: '초등학생', sublabel: '8~13세', icon: '📚' },
]

const GOOD_BADGES = [
  { key: 'punctual',   label: '⏰ 시간 약속을 잘 지켜요' },
  { key: 'caring',     label: '❤️ 아이를 진심으로 예뻐해요' },
  { key: 'comm',       label: '💬 소통이 잘 돼요' },
  { key: 'clean',      label: '🧹 깔끔하게 돌봐요' },
  { key: 'edu',        label: '📚 교육적으로 놀아줘요' },
  { key: 'comfort',    label: '😌 아이가 편안해해요' },
]

export function SeniorProfileScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteP>()
  const { seniorId } = route.params

  const { data: profile, isLoading } = useQuery<SeniorProfile | null>({
    queryKey: ['senior-profile', seniorId],
    queryFn: () => getSeniorProfile(seniorId),
  })

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator testID="loading-indicator" color="#f97316" />
      </SafeAreaView>
    )
  }

  const totalReviews = profile.reviews?.length ?? 0
  const avgRating =
    totalReviews > 0
      ? (profile.reviews!.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
      : null

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b bg-white">
        <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()} className="p-1">
          <Text className="text-xl text-gray-500">←</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">시니어 프로필</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* 프로필 카드 */}
        <View className="bg-white p-5 mb-2">
          <View className="flex-row items-center gap-4 mb-4">
            {/* 아바타 */}
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center">
              <Text className="text-2xl font-bold text-orange-600">
                {profile.nickname.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text testID="senior-name" className="text-base font-bold text-gray-900">
                {profile.nickname} 시니어
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {profile.dong ?? '동네 미인증'} · 활동 경력 {profile.care_count ?? 0}회
              </Text>
              {avgRating && (
                <View className="flex-row items-center gap-1 mt-1">
                  <Text className="text-orange-400">⭐</Text>
                  <Text testID="avg-rating" className="text-sm font-bold text-gray-900">
                    {avgRating}
                  </Text>
                  <Text className="text-xs text-gray-400">(리뷰 {totalReviews}개)</Text>
                </View>
              )}
            </View>
          </View>

          {/* 연령대별 평점 */}
          <Text className="text-xs font-bold text-gray-700 mb-2">연령대별 평점</Text>
          <View className="flex-row gap-2">
            {AGE_CONFIG.map(({ key, label, sublabel, icon }) => {
              const stat = profile.age_stats?.[key]
              const hasData = stat && stat.count > 0
              return (
                <View
                  key={key}
                  testID={`age-stat-${key}`}
                  className={`flex-1 rounded-xl p-3 items-center border ${
                    hasData ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className="text-lg mb-0.5">{icon}</Text>
                  <Text className="text-[10px] text-gray-500 mb-0.5">{label}</Text>
                  <Text className={`text-xl font-black ${hasData ? 'text-orange-500' : 'text-gray-300'}`}>
                    {hasData ? stat!.avg.toFixed(1) : '-'}
                  </Text>
                  <Text className="text-[9px] text-gray-400">
                    {hasData ? `${stat!.count}회` : '경험 없음'}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* 정성 뱃지 */}
        {profile.badge_counts && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-xs font-bold text-gray-700 mb-3">
              이런 점이 좋아요{' '}
              <Text className="text-orange-500">
                {Object.values(profile.badge_counts).reduce((a, b) => a + b, 0)}
              </Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {GOOD_BADGES.map(({ key, label }) => {
                const count = profile.badge_counts?.[key] ?? 0
                if (count === 0) return null
                return (
                  <View key={key} className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                    <Text className="text-xs text-orange-700">
                      {label} <Text className="font-bold">{count}</Text>
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 리뷰 */}
        {profile.reviews && profile.reviews.length > 0 && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-xs font-bold text-gray-700 mb-3">최근 리뷰</Text>
            {profile.reviews.slice(0, 3).map((review, idx) => (
              <View key={idx} className={idx < Math.min(2, profile.reviews!.length - 1) ? 'pb-4 mb-4 border-b border-gray-100' : ''}>
                <View className="flex-row items-center gap-2 mb-1.5">
                  <View className="w-7 h-7 bg-orange-100 rounded-full items-center justify-center">
                    <Text className="text-xs font-bold text-orange-600">부</Text>
                  </View>
                  <View>
                    <Text className="text-xs font-bold text-gray-800">부모님</Text>
                    <View className="flex-row items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Text key={s} className={`text-[10px] ${s <= review.rating ? 'text-orange-400' : 'text-gray-200'}`}>★</Text>
                      ))}
                    </View>
                  </View>
                </View>
                <Text testID={`review-${idx}`} className="text-xs text-gray-600 leading-relaxed">
                  {review.comment}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="h-28" />
      </ScrollView>

      {/* 하단 CTA */}
      <View className="bg-white border-t px-4 py-4 pb-6">
        <TouchableOpacity
          testID="chat-button"
          className="w-full py-3.5 bg-orange-500 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-sm">💬 채팅 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
