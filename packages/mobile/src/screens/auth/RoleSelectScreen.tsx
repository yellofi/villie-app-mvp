import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../navigation/types'
import { useAuthStore } from '../../store/auth.store'
import type { UserType } from '@villie/shared'

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>

export function RoleSelectScreen() {
  const navigation = useNavigation<NavProp>()
  const { setUserType } = useAuthStore()
  const [selected, setSelected] = useState<UserType | null>(null)

  const handleConfirm = () => {
    if (!selected) return
    setUserType(selected)
    navigation.navigate('LocationVerify')
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        어떤 역할로 사용하시나요?
      </Text>
      <Text className="text-gray-500 mb-10">
        나중에 변경할 수 없으니 신중히 선택해주세요
      </Text>

      {/* 부모님 옵션 */}
      <TouchableOpacity
        testID="role-parent"
        onPress={() => setSelected('PARENT')}
        className={`border-2 rounded-2xl p-6 mb-4 ${
          selected === 'PARENT' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
        }`}
      >
        <Text className="text-lg font-semibold text-gray-900">부모님</Text>
        <Text className="text-gray-500 text-sm mt-1">아이 돌봄을 맡길 분</Text>
      </TouchableOpacity>

      {/* 시니어 시터 옵션 */}
      <TouchableOpacity
        testID="role-senior"
        onPress={() => setSelected('SENIOR')}
        className={`border-2 rounded-2xl p-6 mb-8 ${
          selected === 'SENIOR' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
        }`}
      >
        <Text className="text-lg font-semibold text-gray-900">시니어 시터</Text>
        <Text className="text-gray-500 text-sm mt-1">돌봄을 제공할 시니어</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="confirm-button"
        onPress={handleConfirm}
        disabled={selected === null}
        className={`py-4 rounded-xl items-center ${selected ? 'bg-emerald-500' : 'bg-gray-200'}`}
        accessibilityState={{ disabled: selected === null }}
      >
        <Text className={`font-semibold text-base ${selected ? 'text-white' : 'text-gray-400'}`}>
          시작하기
        </Text>
      </TouchableOpacity>
    </View>
  )
}
