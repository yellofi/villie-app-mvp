import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CareRequest } from '@villie/shared'
import { TARGET_AGE_LABEL, formatDistance } from '@villie/shared'
import type { FeedStackParamList } from '../../navigation/types'
import { getCareRequest } from '../../services/care.service'
import { applyToRequest, getMyApplication } from '../../services/application.service'
import { useAuthStore } from '../../store/auth.store'

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'CareDetail'>
type RouteP = RouteProp<FeedStackParamList, 'CareDetail'>

const AGE_EMOJI: Record<string, string> = {
  INFANT: '👶',
  TODDLER: '🧒',
  ELEMENTARY: '📚',
}

export function CareDetailScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteP>()
  const { requestId } = route.params
  const { userId, userType } = useAuthStore()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  // ─── 요청 상세 조회 ───────────────────────────────────────────
  const { data: request, isLoading } = useQuery<CareRequest | null>({
    queryKey: ['care-request', requestId],
    queryFn: () => getCareRequest(requestId),
  })

  // ─── 내 지원 여부 확인 ────────────────────────────────────────
  const { data: myApplication } = useQuery({
    queryKey: ['my-application', requestId, userId],
    queryFn: () =>
      userId ? getMyApplication(requestId, userId) : Promise.resolve(null),
    enabled: !!userId && userType === 'SENIOR',
  })

  // ─── 지원하기 ─────────────────────────────────────────────────
  const { mutate: apply, isPending: isApplying } = useMutation({
    mutationFn: () =>
      applyToRequest({ request_id: requestId, senior_id: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-application', requestId] })
      Alert.alert('지원 완료', '지원이 완료되었어요! 부모님의 연락을 기다려주세요.')
    },
    onError: (e: any) => {
      if (e?.code === '23505') {
        Alert.alert('이미 지원함', '이미 지원한 요청이에요.')
      } else {
        Alert.alert('오류', '지원 중 오류가 발생했어요. 다시 시도해주세요.')
      }
    },
  })

  // ─── 로딩 ─────────────────────────────────────────────────────
  if (isLoading || !request) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#f97316" />
      </SafeAreaView>
    )
  }

  const alreadyApplied = !!myApplication
  const isMyRequest = request.parent_id === userId

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          testID="back-button"
          onPress={() => navigation.goBack()}
          className="mr-3 p-1"
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1" numberOfLines={1}>
          {request.title}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* 뱃지 행 */}
          <View className="flex-row flex-wrap gap-2 mb-5">
            {request.is_urgent && (
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-600 text-xs font-bold">🚨 급구</Text>
              </View>
            )}
            <View className="bg-orange-50 px-3 py-1 rounded-full">
              <Text className="text-orange-700 text-xs font-semibold">
                {AGE_EMOJI[request.target_age]} {TARGET_AGE_LABEL[request.target_age]}
              </Text>
            </View>
            {request.distance_meters != null && (
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-gray-600 text-xs">
                  📍 {formatDistance(request.distance_meters)}
                </Text>
              </View>
            )}
          </View>

          {/* 시급 */}
          <View className="bg-orange-50 rounded-2xl p-5 mb-5">
            <Text className="text-sm text-orange-700 font-medium mb-1">시급</Text>
            <Text testID="hourly-wage" className="text-3xl font-bold text-orange-600">
              {request.hourly_wage.toLocaleString()}원
            </Text>
          </View>

          {/* 희망 일정 */}
          <View className="mb-5">
            <Text className="text-sm text-gray-500 font-medium mb-2">📅 희망 일정</Text>
            <Text testID="schedule-time" className="text-base text-gray-900">
              {request.schedule_time}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              * 실제 확정 일정은 채팅으로 협의해요
            </Text>
          </View>

          {/* 업무 범위 */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 font-medium mb-3">📋 업무 범위</Text>
            <View className="flex-row flex-wrap gap-2">
              {request.tasks.map((task) => (
                <View key={task} className="bg-gray-100 px-3 py-1.5 rounded-full">
                  <Text className="text-gray-700 text-sm">{task}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 작성일 */}
          <Text className="text-xs text-gray-400">
            {new Date(request.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} 작성
          </Text>
        </View>
      </ScrollView>

      {/* 하단 CTA */}
      {userType === 'SENIOR' && !isMyRequest && (
        <View className="px-5 pb-6 pt-3 border-t border-gray-100">
          {alreadyApplied ? (
            <View
              testID="already-applied-badge"
              className="py-4 rounded-xl items-center bg-gray-100"
            >
              <Text className="text-gray-500 font-semibold">이미 지원했어요 ✓</Text>
            </View>
          ) : (
            <TouchableOpacity
              testID="apply-button"
              onPress={() => apply()}
              disabled={isApplying}
              className={`py-4 rounded-xl items-center ${isApplying ? 'bg-gray-200' : 'bg-orange-500'}`}
            >
              {isApplying ? (
                <ActivityIndicator color="#6b7280" />
              ) : (
                <Text className="text-white font-bold text-base">지원하기</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {userType === 'PARENT' && isMyRequest && (
        <View className="px-5 pb-6 pt-3 border-t border-gray-100">
          <View className="py-3 rounded-xl items-center bg-blue-50">
            <Text className="text-blue-600 font-medium text-sm">내가 작성한 요청이에요</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}
