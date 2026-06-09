/**
 * ReviewScreen.test.tsx
 *
 * 돌봄 평가 화면 계약:
 *   - 시니어 이름 렌더
 *   - 별점 5개 렌더
 *   - 별점 선택 시 rating-label 변경
 *   - 정성 뱃지 토글
 *   - 코멘트 입력
 *   - submit 버튼 존재
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ReviewScreen } from './ReviewScreen'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({
    params: { requestId: 'req-1', seniorId: 'senior-1', seniorName: '김영희' },
  }),
}))

jest.mock('../../lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), auth: { getSession: jest.fn() } },
}))

jest.mock('../../services/review.service', () => ({
  createReview: jest.fn(),
}))

jest.mock('../../store/auth.store', () => ({
  useAuthStore: jest.fn(() => ({ userId: 'parent-1' })),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))

import { useMutation } from '@tanstack/react-query'
const mockUseMutation = useMutation as jest.Mock
const mockMutate = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  mockUseMutation.mockReturnValue({ mutate: mockMutate, isPending: false })
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ReviewScreen', () => {
  it('시니어 이름을 렌더한다', () => {
    render(<ReviewScreen />)
    expect(screen.getByText('김영희 시니어')).toBeTruthy()
  })

  it('별점 5개가 렌더된다', () => {
    render(<ReviewScreen />)
    ;[1, 2, 3, 4, 5].forEach((n) => {
      expect(screen.getByTestId(`star-${n}`)).toBeTruthy()
    })
  })

  it('별점 선택 시 rating-label이 변경된다', () => {
    render(<ReviewScreen />)
    fireEvent.press(screen.getByTestId('star-3'))
    expect(screen.getByTestId('rating-label')).toBeTruthy()
    expect(screen.getByText('보통이에요 😐')).toBeTruthy()
  })

  it('정성 뱃지를 선택할 수 있다', () => {
    render(<ReviewScreen />)
    expect(screen.getByTestId('badge-punctual')).toBeTruthy()
    fireEvent.press(screen.getByTestId('badge-punctual'))
  })

  it('코멘트 입력란이 있다', () => {
    render(<ReviewScreen />)
    expect(screen.getByTestId('comment-input')).toBeTruthy()
  })

  it('submit 버튼이 있고 누르면 mutate가 호출된다', () => {
    render(<ReviewScreen />)
    fireEvent.press(screen.getByTestId('submit-button'))
    expect(mockMutate).toHaveBeenCalledTimes(1)
  })
})
