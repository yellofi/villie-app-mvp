import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../navigation/types'
import { useAuthStore } from '../../store/auth.store'
import { supabase } from '../../lib/supabase'
import { upsertUser } from '../../services/user.service'

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'LocationVerify'>

/**
 * 동네 인증 화면 — Phase 1
 *
 * TODO(TD-03): 실제 구현 시
 *   1. 카카오 주소 API 또는 expo-location GPS → b_code 추출
 *   2. user_locations 테이블 upsert
 *   3. handleSkip의 mock 좌표 대신 실제 좌표 사용
 */
export function LocationVerifyScreen() {
  const navigation = useNavigation<NavProp>()
  const { setAuthenticated, userId, userType, nickname, phone } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSkip = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const resolvedId = session?.user?.id ?? userId ?? 'dev-user'
      const resolvedPhone = session?.user?.phone ?? phone ?? ''

      // users 테이블에 저장 (온보딩 완료)
      if (resolvedId !== 'dev-user' && userType) {
        await upsertUser({
          id: resolvedId,
          phone_number: resolvedPhone,
          nickname: nickname || '빌리유저',
          user_type: userType,
        })
      }

      setAuthenticated(resolvedId, userType ?? undefined)
    } catch (e) {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center items-center">
      <Text className="text-2xl font-bold text-gray-900 mb-4">동네 인증</Text>
      <Text className="text-gray-500 text-center mb-10">
        내 동네를 인증하면{'\n'}주변 돌봄 요청을 볼 수 있어요
      </Text>

      {/* TODO(TD-03): 실제 동네 인증 UI */}
      <View className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 items-center mb-8">
        <Text className="text-gray-400">동네 인증 기능 구현 예정</Text>
        <Text className="text-gray-300 text-sm mt-2">GPS 기반 동네 자동 인식</Text>
      </View>

      {error != null && (
        <Text testID="error-message" className="text-red-500 text-sm mb-4 text-center">
          {error}
        </Text>
      )}

      <TouchableOpacity
        testID="skip-button"
        onPress={handleSkip}
        disabled={isLoading}
        className={`py-4 w-full rounded-xl items-center ${isLoading ? 'bg-gray-200' : 'bg-emerald-500'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#6b7280" />
        ) : (
          <Text className="text-white font-semibold text-base">
            지금은 건너뛰기
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
