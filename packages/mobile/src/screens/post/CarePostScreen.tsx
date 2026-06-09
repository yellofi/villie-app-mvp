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

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

const TASK_OPTIONS = [
  '하원', '등원', '간식 챙기기', '식사 준비',
  '목욕', '낮잠 재우기', '놀이 동반', '숙제 봐주기',
  '산책', '분유/이유식',
]

const AGE_OPTIONS: { label: string; sublabel: string; icon: string; value: TargetAge }[] = [
  { label: '영유아', sublabel: '0~3세', icon: '👶', value: 'INFANT' },
  { label: '유아',   sublabel: '4~7세', icon: '🧒', value: 'TODDLER' },
  { label: '초등학생', sublabel: '8~13세', icon: '📚', value: 'ELEMENTARY' },
]

/** 선택된 요일 + 시간으로 schedule_time 문자열 조합 */
function buildScheduleTime(days: string[], startTime: string, endTime: string): string {
  if (days.length === 0 || !startTime || !endTime) return ''
  return `${days.join(',')} ${startTime}~${endTime}`
}

export function CarePostScreen() {
  const navigation = useNavigation()
  const { userId } = useAuthStore()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [targetAge, setTargetAge] = useState<TargetAge | null>(null)
  const [hourlyWage, setHourlyWage] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isUrgent, setIsUrgent] = useState(false)

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const toggleTask = (task: string) => {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    )
  }

  const scheduleTime = buildScheduleTime(selectedDays, startTime, endTime)

  const isValid =
    title.trim().length > 0 &&
    targetAge !== null &&
    hourlyWage.trim().length > 0 &&
    Number(hourlyWage) > 0 &&
    selectedDays.length > 0 &&
    startTime.length > 0 &&
    endTime.length > 0 &&
    selectedTasks.length > 0

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      createCareRequest({
        parent_id: userId!,
        title: title.trim(),
        target_age: targetAge!,
        hourly_wage: Number(hourlyWage),
        schedule_time: scheduleTime,
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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Text className="text-gray-500 text-xl">✕</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">돌봄 요청하기</Text>
        <TouchableOpacity
          testID="submit-button"
          onPress={() => submit()}
          disabled={!isValid || isPending}
          accessibilityState={{ disabled: !isValid || isPending }}
        >
          <Text className={`text-sm font-bold ${isValid && !isPending ? 'text-orange-500' : 'text-gray-300'}`}>
            등록
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4 gap-5">

            {/* 제목 */}
            <View>
              <Text className="text-xs font-bold text-gray-700 mb-1.5">제목</Text>
              <TextInput
                testID="title-input"
                value={title}
                onChangeText={setTitle}
                placeholder="예) 3살 여아 하원 및 저녁 돌봄"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50"
                maxLength={100}
              />
            </View>

            {/* 대상 연령 */}
            <View>
              <Text className="text-xs font-bold text-gray-700 mb-2">돌봄 아이 연령대</Text>
              <View className="flex-row gap-2">
                {AGE_OPTIONS.map(({ label, sublabel, icon, value }) => (
                  <TouchableOpacity
                    key={value}
                    testID={`age-${value}`}
                    onPress={() => setTargetAge(value)}
                    className={`flex-1 py-2.5 rounded-xl items-center border-2 ${
                      targetAge === value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Text className="text-xl mb-0.5">{icon}</Text>
                    <Text className={`text-xs font-bold ${targetAge === value ? 'text-gray-900' : 'text-gray-700'}`}>
                      {label}
                    </Text>
                    <Text className="text-[10px] text-gray-400">{sublabel}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 돌봄 요일 */}
            <View>
              <Text className="text-xs font-bold text-gray-700 mb-2">돌봄 요일</Text>
              <View className="flex-row gap-1.5">
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    testID={`day-${day}`}
                    onPress={() => toggleDay(day)}
                    className={`w-9 h-9 rounded-full items-center justify-center border ${
                      selectedDays.includes(day)
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <Text className={`text-xs font-medium ${selectedDays.includes(day) ? 'text-white' : 'text-gray-600'}`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 돌봄 시간 */}
            <View>
              <Text className="text-xs font-bold text-gray-700 mb-2">돌봄 시간</Text>
              <View className="flex-row items-center gap-3">
                <TextInput
                  testID="start-time"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="16:00"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm text-center font-medium text-gray-800"
                />
                <Text className="text-gray-400 font-bold">~</Text>
                <TextInput
                  testID="end-time"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="19:00"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm text-center font-medium text-gray-800"
                />
              </View>
            </View>

            {/* 시급 */}
            <View>
              <Text className="text-xs font-bold text-gray-700 mb-2">시급</Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                <Text className="text-gray-400 mr-2 text-sm">₩</Text>
                <TextInput
                  testID="wage-input"
                  value={hourlyWage}
                  onChangeText={(v) => setHourlyWage(v.replace(/[^0-9]/g, ''))}
                  placeholder="15000"
                  keyboardType="number-pad"
                  className="flex-1 text-sm text-gray-800 font-medium"
                />
                <Text className="text-sm text-gray-400">원 / 시간</Text>
              </View>
              <Text className="text-[11px] text-gray-400 mt-1">* 2025년 최저 시급: 10,030원</Text>
            </View>

            {/* 업무 범위 */}
            <View>
              <Text className="text-xs font-bold text-gray-700 mb-2">업무 범위 (복수 선택)</Text>
              <View className="gap-2">
                {TASK_OPTIONS.map((task) => (
                  <TouchableOpacity
                    key={task}
                    testID={`task-${task}`}
                    onPress={() => toggleTask(task)}
                    className={`flex-row items-center gap-3 p-3 border rounded-xl ${
                      selectedTasks.includes(task) ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
                    }`}
                  >
                    <View className={`w-4 h-4 rounded border items-center justify-center ${
                      selectedTasks.includes(task) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                    }`}>
                      {selectedTasks.includes(task) && (
                        <Text className="text-white text-[10px]">✓</Text>
                      )}
                    </View>
                    <Text className="text-sm text-gray-700">{task}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 급구 토글 */}
            <View className="flex-row items-center justify-between py-2">
              <View>
                <Text className="text-xs font-bold text-gray-700">🚨 급구 여부</Text>
                <Text className="text-xs text-gray-400 mt-0.5">피드 상단에 우선 노출돼요</Text>
              </View>
              <Switch
                testID="urgent-switch"
                value={isUrgent}
                onValueChange={setIsUrgent}
                trackColor={{ false: '#e5e7eb', true: '#f97316' }}
                thumbColor="#ffffff"
              />
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
