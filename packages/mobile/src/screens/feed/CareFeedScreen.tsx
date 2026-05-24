import React from 'react'
import { View, Text, FlatList, SafeAreaView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { CareRequest } from '@villie/shared'
import { CareRequestCard } from '../../components/feed/CareRequestCard'

/**
 * 돌봄 요청 피드 화면 — Phase 1 (mock 데이터)
 *
 * TODO(Supabase): Supabase 연결 후 실제 쿼리로 교체
 *   - ST_DWithin 반경 3km 필터
 *   - boosted_until → is_urgent → distance → created_at 4단계 정렬
 *   - TanStack Query로 캐싱
 */

const MOCK_REQUESTS: CareRequest[] = [
  {
    id: 'req-1',
    parent_id: 'parent-1',
    title: '오늘 오후 하원 시터 급하게 구해요',
    target_age: 'TODDLER',
    hourly_wage: 15000,
    schedule_time: '오늘 15:00~19:00',
    tasks: ['하원', '간식', '놀이 동반'],
    is_urgent: true,
    boosted_until: null,
    status: 'RECRUITING',
    b_code: '1168010100',
    created_at: '2026-05-25T09:00:00Z',
    distance_meters: 320,
  },
  {
    id: 'req-2',
    parent_id: 'parent-2',
    title: '주 2회 영유아 돌봄 도움 주실 분',
    target_age: 'INFANT',
    hourly_wage: 12000,
    schedule_time: '화, 목 10:00~14:00',
    tasks: ['분유/이유식', '낮잠 재우기', '간단한 놀이'],
    is_urgent: false,
    boosted_until: null,
    status: 'RECRUITING',
    b_code: '1168010200',
    created_at: '2026-05-25T08:00:00Z',
    distance_meters: 850,
  },
  {
    id: 'req-3',
    parent_id: 'parent-3',
    title: '초등학교 1학년 하원 및 숙제 도움',
    target_age: 'ELEMENTARY',
    hourly_wage: 11000,
    schedule_time: '월~금 14:00~17:00',
    tasks: ['하원', '숙제 봐주기', '간식 챙기기'],
    is_urgent: false,
    boosted_until: null,
    status: 'RECRUITING',
    b_code: '1168010300',
    created_at: '2026-05-24T18:00:00Z',
    distance_meters: 1400,
  },
]

export function CareFeedScreen() {
  const navigation = useNavigation()

  const handleCardPress = (_request: CareRequest) => {
    // TODO: navigate to detail screen
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
        data={MOCK_REQUESTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CareRequestCard request={item} onPress={handleCardPress} />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-base">주변에 돌봄 요청이 없어요</Text>
            <Text className="text-gray-300 text-sm mt-1">나중에 다시 확인해보세요</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
