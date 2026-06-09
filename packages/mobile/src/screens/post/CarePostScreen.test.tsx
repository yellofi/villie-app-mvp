/**
 * CarePostScreen.test.tsx
 *
 * 돌봄 요청 작성 화면 계약:
 *   - 초기 상태에서 submit 버튼 비활성화
 *   - 필수 항목 모두 입력 시 submit 버튼 활성화
 *   - 대상 연령 버튼 선택
 *   - 업무 범위 태그 토글
 *   - 급구 스위치 렌더
 *   - 유효한 폼 submit 시 mutate 호출
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { CarePostScreen } from './CarePostScreen'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
}))

jest.mock('../../lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), auth: { getSession: jest.fn() } },
}))

jest.mock('../../services/care.service', () => ({
  createCareRequest: jest.fn(),
}))

jest.mock('../../store/auth.store', () => ({
  useAuthStore: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))

import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth.store'

const mockUseMutation = useMutation as jest.Mock
const mockUseAuthStore = useAuthStore as jest.Mock
const mockMutate = jest.fn()

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** 필수 항목 5개를 모두 채우는 헬퍼 */
function fillAllRequiredFields() {
  fireEvent.changeText(screen.getByTestId('title-input'), '오늘 오후 하원 시터 구해요')
  fireEvent.press(screen.getByTestId('age-TODDLER'))
  fireEvent.changeText(screen.getByTestId('wage-input'), '15000')
  fireEvent.changeText(screen.getByTestId('schedule-input'), '오늘 15:00~19:00')
  fireEvent.press(screen.getByTestId('task-하원'))
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseMutation.mockReturnValue({ mutate: mockMutate, isPending: false })
  mockUseAuthStore.mockReturnValue({ userId: 'parent-1' })
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CarePostScreen', () => {
  it('초기 상태에서 submit 버튼이 비활성화된다', () => {
    render(<CarePostScreen />)
    const button = screen.getByTestId('submit-button')
    expect(button.props.accessibilityState?.disabled).toBe(true)
  })

  it('필수 항목을 모두 입력하면 submit 버튼이 활성화된다', () => {
    render(<CarePostScreen />)
    fillAllRequiredFields()
    const button = screen.getByTestId('submit-button')
    expect(button.props.accessibilityState?.disabled).toBe(false)
  })

  it('대상 연령 버튼 3개가 모두 렌더된다', () => {
    render(<CarePostScreen />)
    expect(screen.getByTestId('age-INFANT')).toBeTruthy()
    expect(screen.getByTestId('age-TODDLER')).toBeTruthy()
    expect(screen.getByTestId('age-ELEMENTARY')).toBeTruthy()
  })

  it('업무 범위 태그를 선택할 수 있다', () => {
    render(<CarePostScreen />)
    const taskBtn = screen.getByTestId('task-하원')
    fireEvent.press(taskBtn)
    expect(taskBtn).toBeTruthy()
  })

  it('급구 스위치가 렌더된다', () => {
    render(<CarePostScreen />)
    expect(screen.getByTestId('urgent-switch')).toBeTruthy()
  })

  it('유효한 폼 submit 시 mutate가 호출된다', () => {
    render(<CarePostScreen />)
    fillAllRequiredFields()
    fireEvent.press(screen.getByTestId('submit-button'))
    expect(mockMutate).toHaveBeenCalledTimes(1)
  })
})
