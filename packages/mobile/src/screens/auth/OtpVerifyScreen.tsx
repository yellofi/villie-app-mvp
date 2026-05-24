import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { AuthStackParamList } from '../../navigation/types'
import { normalizePhone } from '../../utils/phone'
import { supabase } from '../../lib/supabase'

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>
type OtpRoute = RouteProp<AuthStackParamList, 'OtpVerify'>

export function OtpVerifyScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<OtpRoute>()
  const { phone } = route.params

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = otp.length === 6

  const handleVerify = async () => {
    if (!valid || isLoading) return
    setIsLoading(true)
    setError(null)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token: otp,
      type: 'sms',
    })

    setIsLoading(false)

    if (verifyError) {
      setError(verifyError.message)
      return
    }

    navigation.navigate('RoleSelect')
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        인증번호를 입력해주세요
      </Text>
      <Text testID="phone-display" className="text-gray-500 mb-10">
        {phone}
      </Text>

      <TextInput
        testID="otp-input"
        value={otp}
        onChangeText={setOtp}
        placeholder="6자리 숫자"
        keyboardType="number-pad"
        maxLength={6}
        className="border border-gray-300 rounded-xl px-4 py-4 text-base mb-3 text-center tracking-widest"
      />

      {error != null && (
        <Text testID="error-message" className="text-red-500 text-sm mb-3">
          {error}
        </Text>
      )}

      <TouchableOpacity
        testID="verify-button"
        onPress={handleVerify}
        disabled={!valid || isLoading}
        className={`py-4 rounded-xl items-center mt-2 ${valid ? 'bg-emerald-500' : 'bg-gray-200'}`}
        accessibilityState={{ disabled: !valid || isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className={`font-semibold text-base ${valid ? 'text-white' : 'text-gray-400'}`}>
            확인
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
