import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import type { CareRequest } from '@villie/shared'
import { TARGET_AGE_LABEL, formatDistance } from '@villie/shared'

interface Props {
  request: CareRequest
  onPress: (request: CareRequest) => void
}

export function CareRequestCard({ request, onPress }: Props) {
  const {
    title,
    target_age,
    hourly_wage,
    schedule_time,
    is_urgent,
    distance_meters,
  } = request

  const formattedWage = `시급 ${hourly_wage.toLocaleString('ko-KR')}원`
  const ageLabel = TARGET_AGE_LABEL[target_age]
  const distanceLabel = distance_meters != null ? formatDistance(distance_meters) : null

  return (
    <TouchableOpacity
      testID="care-request-card"
      onPress={() => onPress(request)}
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 shadow-sm"
      activeOpacity={0.7}
    >
      {/* 상단: 급구 뱃지 + 거리 */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          {is_urgent && (
            <View className="bg-red-50 rounded-full px-2 py-0.5">
              <Text className="text-red-500 text-xs font-semibold">🚨 급구</Text>
            </View>
          )}
          <View className="bg-emerald-50 rounded-full px-2 py-0.5">
            <Text className="text-emerald-700 text-xs font-medium">{ageLabel}</Text>
          </View>
        </View>
        {distanceLabel != null && (
          <Text className="text-gray-400 text-xs">{distanceLabel}</Text>
        )}
      </View>

      {/* 제목 */}
      <Text className="text-base font-semibold text-gray-900 mb-2" numberOfLines={2}>
        {title}
      </Text>

      {/* 하단: 시급 + 일정 태그 */}
      <View className="flex-row items-center gap-2 flex-wrap">
        <View className="bg-gray-100 rounded-lg px-3 py-1">
          <Text className="text-gray-700 text-sm font-medium">{formattedWage}</Text>
        </View>
        <View className="bg-gray-100 rounded-lg px-3 py-1">
          <Text className="text-gray-700 text-sm">{schedule_time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
