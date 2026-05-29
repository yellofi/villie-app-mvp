import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../navigation/types'
import { useAuthStore } from '../../store/auth.store'
import { supabase } from '../../lib/supabase'

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'LocationVerify'>

/**
 * 동네 인증 화면 — Phase 1 placeholder
 *
 * TODO(TD-03): 실제 구현 시
 * 1. 카카오 주소 검색 API 또는 GPS → b_code 추출
 * 2. user_locations 테이블 upsert
 * 3. setAuthenticated(userId) 호출 → 메인 앱 진입
 */
export function LocationVerifyScreen() {
  const navigation = useNavigation<NavProp>()
  const { setAuthenticated, userId } = useAuthStore()

  const handleSkip = async () => {
    // 현재 Supabase 세션에서 userId 추출 (우선순위: 세션 > 스토어 > dev-user)
    const { data: { session } } = await supabase.auth.getSession()
    const resolvedId = session?.user?.id ?? userId ?? 'dev-user'
    setAuthenticated(resolvedId)
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center items-center">
      <Text className="text-2xl font-bold text-gray-900 mb-4">동네 인증</Text>
      <Text className="text-gray-500 text-center mb-10">
        내 동네를 인증하면{'\n'}주변 돌봄 요청을 볼 수 있어요
      </Text>

      {/* TODO: 실제 동네 인증 UI */}
      <View className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 items-center mb-8">
        <Text className="text-gray-400">동네 인증 기능 구현 예정</Text>
      </View>

      <TouchableOpacity
        onPress={handleSkip}
        className="py-4 w-full rounded-xl items-center bg-emerald-500"
      >
        <Text className="text-white font-semibold text-base">
          개발 중 — 건너뛰기
        </Text>
      </TouchableOpacity>
    </View>
  )
}
