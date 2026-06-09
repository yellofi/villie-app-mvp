import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { FeedStackParamList } from '../../navigation/types'
import { useAuthStore } from '../../store/auth.store'
import { createReview } from '../../services/review.service'

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'Review'>
type RouteP = RouteProp<FeedStackParamList, 'Review'>

const RATING_LABELS = ['', '아쉬웠어요 😔', '조금 아쉬웠어요 😕', '보통이에요 😐', '만족해요 😊', '매우 만족해요 ✨']

const BADGE_OPTIONS = [
  { key: 'punctual', label: '⏰ 시간 약속을 잘 지켜요' },
  { key: 'caring',   label: '❤️ 아이를 진심으로 예뻐해요' },
  { key: 'comm',     label: '💬 소통이 잘 돼요' },
  { key: 'clean',    label: '🧹 깔끔하게 돌봐요' },
  { key: 'edu',      label: '📚 교육적으로 놀아줘요' },
  { key: 'comfort',  label: '😌 아이가 편안해해요' },
]

export function ReviewScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteP>()
  const { requestId, seniorId, seniorName } = route.params
  const { userId } = useAuthStore()
  const queryClient = useQueryClient()

  const [rating, setRating] = useState(5)
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [comment, setComment] = useState('')

  const toggleBadge = (key: string) => {
    setSelectedBadges((prev) =>
      prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key]
    )
  }

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      createReview({
        reviewer_id: userId!,
        reviewee_id: seniorId,
        request_id: requestId,
        rating,
        badges: selectedBadges,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senior-profile', seniorId] })
      Alert.alert('평가 완료', '리뷰가 등록되었어요!', [
        { text: '확인', onPress: () => navigation.goBack() },
      ])
    },
    onError: () => {
      Alert.alert('오류', '평가 등록 중 오류가 발생했어요.')
    },
  })

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="w-8" />
        <Text className="text-base font-bold text-gray-900">돌봄 완료 후 평가</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-xs text-gray-400">나중에</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">

          {/* 완료 표시 */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
              <Text className="text-2xl">✓</Text>
            </View>
            <Text className="text-lg font-black text-gray-900">돌봄이 완료되었어요!</Text>
            <Text className="text-sm text-gray-400 mt-1">
              {seniorName} 시니어와의 돌봄은 어떠셨나요?
            </Text>
          </View>

          {/* 시니어 요약 */}
          <View className="flex-row items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
              <Text className="text-base font-bold text-orange-600">
                {seniorName.charAt(0)}
              </Text>
            </View>
            <Text className="text-sm font-bold text-gray-900">{seniorName} 시니어</Text>
          </View>

          {/* 별점 */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-900 mb-0.5">전반적인 만족도</Text>
            <Text className="text-xs text-gray-400 mb-3">평점에 반영됩니다</Text>
            <View testID="star-row" className="flex-row justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  testID={`star-${star}`}
                  onPress={() => setRating(star)}
                >
                  <Text className={`text-4xl ${star <= rating ? 'text-orange-400' : 'text-gray-200'}`}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text testID="rating-label" className="text-center text-sm font-bold text-orange-500 mt-2">
              {RATING_LABELS[rating]}
            </Text>
          </View>

          {/* 정성 뱃지 */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-900 mb-3">
              어떤 점이 좋았나요?{' '}
              <Text className="text-gray-400 font-normal text-xs">(복수 선택)</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {BADGE_OPTIONS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  testID={`badge-${key}`}
                  onPress={() => toggleBadge(key)}
                  className={`px-3 py-2 border rounded-full ${
                    selectedBadges.includes(key)
                      ? 'bg-orange-50 border-orange-400'
                      : 'border-gray-200'
                  }`}
                >
                  <Text className={`text-xs ${selectedBadges.includes(key) ? 'text-orange-700' : 'text-gray-600'}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 텍스트 리뷰 */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-900 mb-2">
              한 줄 리뷰{' '}
              <Text className="text-gray-400 font-normal text-xs">(선택)</Text>
            </Text>
            <TextInput
              testID="comment-input"
              value={comment}
              onChangeText={setComment}
              placeholder="솔직한 리뷰를 남겨주세요"
              multiline
              numberOfLines={3}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 h-20"
            />
          </View>

          <TouchableOpacity
            testID="submit-button"
            onPress={() => submit()}
            disabled={isPending}
            className={`w-full py-4 rounded-xl items-center ${isPending ? 'bg-gray-200' : 'bg-orange-500'}`}
          >
            <Text className={`font-bold text-sm ${isPending ? 'text-gray-400' : 'text-white'}`}>
              평가 등록하기
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-400 text-center mt-2.5">
            리뷰는 {seniorName} 시니어 프로필에 공개됩니다
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
