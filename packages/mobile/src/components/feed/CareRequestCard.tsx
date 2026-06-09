import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import type { CareRequest } from '@villie/shared'
import { TARGET_AGE_LABEL, formatDistance } from '@villie/shared'

interface Props {
  request: CareRequest
  onPress: (request: CareRequest) => void
}

const AGE_ICON: Record<string, string> = {
  INFANT: '👶',
  TODDLER: '🧒',
  ELEMENTARY: '📚',
}

export function CareRequestCard({ request, onPress }: Props) {
  const {
    title,
    target_age,
    hourly_wage,
    schedule_time,
    tasks,
    is_urgent,
    status,
    distance_meters,
  } = request

  const ageLabel = TARGET_AGE_LABEL[target_age]
  const distanceLabel = distance_meters != null ? formatDistance(distance_meters) : null
  const isRecruiting = status === 'RECRUITING'

  return (
    <TouchableOpacity
      testID="care-request-card"
      onPress={() => onPress(request)}
      className={`bg-white p-4 mb-2 border-b border-gray-100 ${!isRecruiting ? 'opacity-50' : ''}`}
      activeOpacity={0.7}
    >
      {/* 상단: 제목 + 모집 상태 뱃지 */}
      <View className="flex-row items-start justify-between mb-1.5">
        <Text className="text-sm font-bold text-gray-900 flex-1 mr-2" numberOfLines={2}>
          {is_urgent ? '🚨 ' : ''}{title}
        </Text>
        <View className={`px-2 py-0.5 rounded flex-shrink-0 ${isRecruiting ? 'bg-orange-100' : 'bg-gray-200'}`}>
          <Text className={`text-xs font-bold ${isRecruiting ? 'text-orange-600' : 'text-gray-500'}`}>
            {isRecruiting ? '모집중' : '매칭완료'}
          </Text>
        </View>
      </View>

      {/* 동네 · 시간 · 거리 */}
      <Text className="text-xs text-gray-400 mb-2.5">
        {distanceLabel ? `${distanceLabel} 거리 · ` : ''}{schedule_time}
      </Text>

      {/* 태그: 연령대, 시급 */}
      <View className="flex-row flex-wrap gap-1.5 mb-3">
        <View className="px-2 py-1 bg-gray-100 rounded-full">
          <Text className="text-xs text-gray-600">
            {AGE_ICON[target_age]} {ageLabel}
          </Text>
        </View>
        <View className="px-2 py-1 bg-orange-50 rounded-full">
          <Text className="text-xs text-orange-700 font-semibold">
            시급 {hourly_wage.toLocaleString('ko-KR')}원
          </Text>
        </View>
      </View>

      {/* 업무 범위 */}
      {tasks.length > 0 && (
        <View className="bg-gray-50 p-2.5 rounded-lg">
          <Text className="text-xs font-bold text-gray-600 mb-1">업무 범위</Text>
          {tasks.slice(0, 3).map((task) => (
            <Text key={task} className="text-xs text-gray-500">
              ✓ {task}
            </Text>
          ))}
          {tasks.length > 3 && (
            <Text className="text-xs text-gray-400 mt-0.5">+{tasks.length - 3}개 더</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}
