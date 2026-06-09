/**
 * CareFeedScreen.test.tsx
 *
 * 돌봄 요청 피드 화면 계약:
 *   - 헤더 "빌리 피드" 렌더
 *   - 데이터 로딩 완료 시 카드 목록 렌더
 *   - 급구 카드에 🚨 표시
 *   - 빈 상태 문구 표시
 *   - 에러 상태 처리
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { CareFeedScreen } from './CareFeedScreen'
import type { CareRequest } from '@villie/shared'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}))

jest.mock('../../lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), auth: { getSession: jest.fn() } },
}))

jest.mock('../../store/auth.store', () => ({
  useAuthStore: jest.fn(() => ({ userType: 'SENIOR' })),
}))

// useQuery를 직접 mock — 비동기 타이밍 이슈 없이 동기적으로 상태 제어
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

import { useQuery } from '@tanstack/react-query'
const mockUseQuery = useQuery as jest.Mock

const MOCK_REQUESTS: CareRequest[] = [
  {
    id: 'req-1',
    parent_id: 'parent-1',
    title: '오늘 오후 하원 시터 급하게 구해요',
    target_age: 'TODDLER',
    hourly_wage: 15000,
    schedule_time: '오늘 15:00~19:00',
    tasks: ['하원', '간식'],
    is_urgent: true,
    boosted_until: null,
    status: 'RECRUITING',
    b_code: '1168010100',
    created_at: '2026-05-25T09:00:00Z',
    distance_meters: 320,
  },
  {
    id: 'req-2',
    parent_id: 'parent-2',
    title: '주 2회 영유아 돌봄',
    target_age: 'INFANT',
    hourly_wage: 12000,
    schedule_time: '화, 목 10:00~14:00',
    tasks: ['분유/이유식'],
    is_urgent: false,
    boosted_until: null,
    status: 'RECRUITING',
    b_code: '1168010200',
    created_at: '2026-05-25T08:00:00Z',
    distance_meters: 850,
  },
]

function mockQuerySuccess(data: CareRequest[]) {
  mockUseQuery.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockQuerySuccess(MOCK_REQUESTS)
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CareFeedScreen', () => {
  it('헤더에 동네명을 렌더한다', () => {
    render(<CareFeedScreen />)
    expect(screen.getByText('서초4동')).toBeTruthy()
  })

  it('로딩 완료 후 카드들을 렌더한다', () => {
    render(<CareFeedScreen />)
    const cards = screen.getAllByTestId('care-request-card')
    expect(cards.length).toBe(2)
  })

  it('급구 게시글에 🚨를 표시한다', () => {
    render(<CareFeedScreen />)
    const urgentBadges = screen.getAllByText(/🚨/)
    expect(urgentBadges.length).toBeGreaterThan(0)
  })

  it('데이터가 비어있으면 빈 상태 문구를 렌더한다', () => {
    mockQuerySuccess([])
    render(<CareFeedScreen />)
    expect(screen.getByText('주변에 돌봄 요청이 없어요')).toBeTruthy()
  })

  it('로딩 중에는 ActivityIndicator를 렌더한다', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    })
    render(<CareFeedScreen />)
    expect(screen.getByTestId('loading-indicator')).toBeTruthy()
  })

  it('오류 발생 시 에러 메시지를 렌더한다', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
      isRefetching: false,
    })
    render(<CareFeedScreen />)
    expect(screen.getByText('피드를 불러오지 못했어요')).toBeTruthy()
  })
})
