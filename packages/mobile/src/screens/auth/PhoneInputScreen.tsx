import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../navigation/types'
import { formatPhone, isValidPhone, normalizePhone } from '../../utils/phone'
import { supabase } from '../../lib/supabase'

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'PhoneInput'>

export function PhoneInputScreen() {
  const navigation = useNavigation<NavProp>()
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = isValidPhone(phone)

  const handleSubmit = async () => {
    if (!valid || isLoading) return
    setIsLoading(true)
    setError(null)

    const { data, error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
    })

    setIsLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    // Enable phone confirmations = OFF (TD-01):
    //   signInWithOtp가 즉시 세션을 반환 → OTP 화면 스킵
    // Enable phone confirmations = ON (Twilio 연결 후):
    //   data.session이 null → OTP 입력 화면으로 이동
    if (data?.session) {
      navigation.navigate('RoleSelect')
      return
    }

    navigation.navigate('OtpVerify', { phone: formatPhone(phone) })
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        빌리에 오신 걸 환영해요
      </Text>
      <Text className="text-gray-500 mb-10">
        전화번호로 간편하게 시작해요
      </Text>

      <TextInput
        testID="phone-input"
        value={phone}
        onChangeText={setPhone}
        placeholder="010-0000-0000"
        keyboardType="phone-pad"
        autoFocus
        className="border border-gray-300 rounded-xl px-4 py-4 text-base mb-3"
      />

      {error != null && (
        <Text testID="error-message" className="text-red-500 text-sm mb-3">
          {error}
        </Text>
      )}

      <TouchableOpacity
        testID="submit-button"
        onPress={handleSubmit}
        disabled={!valid || isLoading}
        className={`py-4 rounded-xl items-center mt-2 ${valid ? 'bg-emerald-500' : 'bg-gray-200'}`}
        accessibilityState={{ disabled: !valid || isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className={`font-semibold text-base ${valid ? 'text-white' : 'text-gray-400'}`}>
            인증번호 받기
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
