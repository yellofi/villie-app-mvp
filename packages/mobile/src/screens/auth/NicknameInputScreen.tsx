import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../navigation/types'
import { useAuthStore } from '../../store/auth.store'

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'NicknameInput'>

const MIN_LEN = 2
const MAX_LEN = 10

export function NicknameInputScreen() {
  const navigation = useNavigation<NavProp>()
  const { setNickname } = useAuthStore()
  const [value, setValue] = useState('')

  const isValid = value.trim().length >= MIN_LEN && value.trim().length <= MAX_LEN

  const handleNext = () => {
    if (!isValid) return
    setNickname(value.trim())
    navigation.navigate('LocationVerify')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 justify-center">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          어떻게 불러드릴까요?
        </Text>
        <Text className="text-gray-500 mb-10">
          빌리에서 사용할 닉네임을 입력해주세요
        </Text>

        <TextInput
          testID="nickname-input"
          value={value}
          onChangeText={setValue}
          placeholder="닉네임 (2~10자)"
          maxLength={MAX_LEN}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleNext}
          className="border border-gray-300 rounded-xl px-4 py-4 text-base mb-2"
        />

        <Text className="text-xs text-gray-400 mb-8 text-right">
          {value.trim().length}/{MAX_LEN}자
        </Text>

        <TouchableOpacity
          testID="next-button"
          onPress={handleNext}
          disabled={!isValid}
          className={`py-4 rounded-xl items-center ${isValid ? 'bg-orange-500' : 'bg-gray-200'}`}
          accessibilityState={{ disabled: !isValid }}
        >
          <Text
            className={`font-semibold text-base ${isValid ? 'text-white' : 'text-gray-400'}`}
          >
            다음
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
