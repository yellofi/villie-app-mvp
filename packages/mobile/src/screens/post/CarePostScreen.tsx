import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TargetAge } from '@villie/shared'
import { TARGET_AGE_LABEL } from '@villie/shared'
import { useAuthStore } from '../../store/auth.store'
import { createCareRequest } from '../../services/care.service'

const TASK_OPTIONS = [
  '하원', '등원', '간식 챙기기', '식사 준비',
  '목욕', '낮잠 재우기', '놀이 동반', '숙제 봐주기',
  '산책', '분유/이유식',
]

const AGE_OPTIONS: { label: string; value: TargetAge }[] = [
  { label: TARGET_AGE_LABEL.INFANT, value: 'INFANT' },
  { label: TARGET_AGE_LABEL.TODDLER, value: 'TODDLER' },
  { label: TARGET_AGE_LABEL.ELEMENTARY, value: 'ELEMENTARY' },
]

export function CarePostScreen() {
  const navigation = useNavigation()
  const { userId } = useAuthStore()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [targetAge, setTargetAge] = useState<TargetAge | null>(null)
  const [hourlyWage, setHourlyWage] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isUrgent, setIsUrgent] = useState(false)

  const toggleTask = (task: string) => {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    )
  }

  const isValid =
    title.trim().length > 0 &&
    targetAge !== null &&
    hourlyWage.trim().length > 0 &&
    Number(hourlyWage) > 0 &&
    scheduleTime.trim().length > 0 &&
    selectedTasks.length > 0

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      createCareRequest({
        parent_id: userId!,
        title: title.trim(),
        target_age: targetAge!,
        hourly_wage: Number(hourlyWage),
        schedule_time: scheduleTime.trim(),
        tasks: selectedTasks,
        is_urgent: isUrgent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-feed'] })
      Alert.alert('등록 완료', '돌봄 요청이 등록되었어요!', [
        { text: '확인', onPress: () => navigation.goBack() },
      ])
    },
    onError: () => {
      Alert.alert('오류', '요청 등록 중 오류가 발생했어요. 다시 시도해주세요.')
    },
  })

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">돌봄 요청 작성</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="py-6 gap-6">

            {/* 제목 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">제목 *</Text>
              <TextInput
                testID="title-input"
                value={title}
                onChangeText={setTitle}
                placeholder="예) 오늘 오후 하원 시터 구해요"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                maxLength={100}
              />
            </View>

            {/* 대상 연령 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-3">대상 연령 *</Text>
              <View className="flex-row gap-2">
                {AGE_OPTIONS.map(({ label, value }) => (
                  <TouchableOpacity
                    key={value}
                    testID={`age-${value}`}
                    onPress={() => setTargetAge(value)}
                    className={`flex-1 py-3 rounded-xl items-center border-2 ${
                      targetAge === value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        targetAge === value ? 'text-emerald-700' : 'text-gray-600'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 시급 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">시급 *</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
                <TextInput
                  testID="wage-input"
                  value={hourlyWage}
                  onChangeText={(v) => setHourlyWage(v.replace(/[^0-9]/g, ''))}
                  placeholder="10000"
                  keyboardType="number-pad"
                  className="flex-1 text-base"
                />
                <Text className="text-gray-500 font-medium">원/시간</Text>
              </View>
            </View>

            {/* 희망 일정 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">희망 일정 *</Text>
              <TextInput
                testID="schedule-input"
                value={scheduleTime}
                onChangeText={setScheduleTime}
                placeholder="예) 월, 수 16:00~19:00"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
              <Text className="text-xs text-gray-400 mt-1">
                실제 일정은 채팅으로 협의해요
              </Text>
            </View>

            {/* 업무 범위 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-3">업무 범위 *</Text>
              <View className="flex-row flex-wrap gap-2">
                {TASK_OPTIONS.map((task) => (
                  <TouchableOpacity
                    key={task}
                    testID={`task-${task}`}
                    onPress={() => toggleTask(task)}
                    className={`px-3 py-2 rounded-full border ${
                      selectedTasks.includes(task)
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedTasks.includes(task) ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {task}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 급구 토글 */}
            <View className="flex-row items-center justify-between py-2">
              <View>
                <Text className="text-sm font-semibold text-gray-700">🚨 급구 여부</Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  피드 상단에 우선 노출돼요
                </Text>
              </View>
              <Switch
                testID="urgent-switch"
                value={isUrgent}
                onValueChange={setIsUrgent}
                trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                thumbColor="#ffffff"
              />
            </View>

          </View>
        </ScrollView>

        {/* 등록 버튼 */}
        <View className="px-5 pb-6 pt-3 border-t border-gray-100">
          <TouchableOpacity
            testID="submit-button"
            onPress={() => submit()}
            disabled={!isValid || isPending}
            className={`py-4 rounded-xl items-center ${
              isValid && !isPending ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
            accessibilityState={{ disabled: !isValid || isPending }}
          >
            {isPending ? (
              <ActivityIndicator color="#6b7280" />
            ) : (
              <Text
                className={`font-bold text-base ${
                  isValid ? 'text-white' : 'text-gray-400'
                }`}
              >
                돌봄 요청 등록하기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
