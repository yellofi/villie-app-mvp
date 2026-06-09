/**
 * SeniorProfileScreen.test.tsx
 *
 * 시니어 프로필 화면 계약:
 *   - 시니어 이름 렌더
 *   - 평균 별점 렌더
 *   - 연령대별 평점 칸 3개 렌더
 *   - 리뷰 목록 렌더
 *   - 뒤로가기 버튼 존재
 *   - 채팅 시작 버튼 존재
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { SeniorProfileScreen } from './SeniorProfileScreen'
import type { SeniorProfile } from '../../services/senior.service'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: { seniorId: 'senior-1' } }),
}))

jest.mock('../../lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), auth: { getSession: jest.fn() } },
}))

jest.mock('../../services/senior.service', () => ({
  getSeniorProfile: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

import { useQuery } from '@tanstack/react-query'
const mockUseQuery = useQuery as jest.Mock

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_PROFILE: SeniorProfile = {
  id: 'senior-1',
  nickname: '김영희',
  dong: '서초4동',
  care_count: 24,
  age_stats: {
    INFANT:  { avg: 4.9, count: 14 },
    TODDLER: { avg: 4.8, count: 10 },
  },
  badge_counts: {
    punctual: 18,
    caring:   22,
    comm:     15,
  },
  reviews: [
    { rating: 5, comment: '항상 시간을 잘 지키세요!', created_at: '2026-05-01T00:00:00Z' },
    { rating: 4, comment: '소통이 잘 돼서 좋았어요.', created_at: '2026-04-15T00:00:00Z' },
  ],
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseQuery.mockReturnValue({ data: MOCK_PROFILE, isLoading: false })
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SeniorProfileScreen', () => {
  it('시니어 이름을 렌더한다', () => {
    render(<SeniorProfileScreen />)
    expect(screen.getByTestId('senior-name')).toBeTruthy()
    expect(screen.getByText('김영희 시니어')).toBeTruthy()
  })

  it('평균 별점을 렌더한다', () => {
    render(<SeniorProfileScreen />)
    expect(screen.getByTestId('avg-rating')).toBeTruthy()
  })

  it('연령대별 평점 칸 3개를 렌더한다', () => {
    render(<SeniorProfileScreen />)
    expect(screen.getByTestId('age-stat-INFANT')).toBeTruthy()
    expect(screen.getByTestId('age-stat-TODDLER')).toBeTruthy()
    expect(screen.getByTestId('age-stat-ELEMENTARY')).toBeTruthy()
  })

  it('리뷰를 렌더한다', () => {
    render(<SeniorProfileScreen />)
    expect(screen.getByTestId('review-0')).toBeTruthy()
    expect(screen.getByText('항상 시간을 잘 지키세요!')).toBeTruthy()
  })

  it('뒤로가기 버튼이 있다', () => {
    render(<SeniorProfileScreen />)
    expect(screen.getByTestId('back-button')).toBeTruthy()
  })

  it('채팅 시작 버튼이 있다', () => {
    render(<SeniorProfileScreen />)
    expect(screen.getByTestId('chat-button')).toBeTruthy()
  })
})
