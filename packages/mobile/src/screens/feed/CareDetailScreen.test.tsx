/**
 * CareDetailScreen.test.tsx
 *
 * 돌봄 요청 상세 화면 계약:
 *   - 요청 제목 / 시급 / 일정 렌더
 *   - SENIOR → 지원하기 버튼 노출
 *   - SENIOR + 이미 지원 → already-applied-badge 노출
 *   - PARENT + 내 요청 → "내가 작성한 요청이에요" 노출
 *   - 뒤로가기 버튼 존재
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { CareDetailScreen } from './CareDetailScreen'
import type { CareRequest } from '@villie/shared'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: { requestId: 'req-1' } }),
}))

jest.mock('../../lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), auth: { getSession: jest.fn() } },
}))

jest.mock('../../services/care.service', () => ({
  getCareRequest: jest.fn(),
}))

jest.mock('../../services/application.service', () => ({
  applyToRequest: jest.fn(),
  getMyApplication: jest.fn(),
}))

jest.mock('../../store/auth.store', () => ({
  useAuthStore: jest.fn(),
}))

// useQuery 두 번 호출됨 (request, myApplication) — 직접 mock으로 순서 제어
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))

import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth.store'

const mockUseQuery = useQuery as jest.Mock
const mockUseMutation = useMutation as jest.Mock
const mockUseAuthStore = useAuthStore as jest.Mock

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_REQUEST: CareRequest = {
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
}

// 1번 호출: request 데이터, 2번 호출(이후): myApplication 데이터
function mockQueries(myApplication: object | null = null) {
  mockUseQuery
    .mockReturnValueOnce({ data: MOCK_REQUEST, isLoading: false })
    .mockReturnValue({ data: myApplication, isLoading: false })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseMutation.mockReturnValue({ mutate: jest.fn(), isPending: false })
  mockUseAuthStore.mockReturnValue({ userId: 'senior-1', userType: 'SENIOR' })
  mockQueries()
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CareDetailScreen', () => {
  it('요청 제목을 렌더한다', () => {
    render(<CareDetailScreen />)
    expect(screen.getByText('오늘 오후 하원 시터 급하게 구해요')).toBeTruthy()
  })

  it('시급과 희망 일정을 렌더한다', () => {
    render(<CareDetailScreen />)
    expect(screen.getByTestId('hourly-wage')).toBeTruthy()
    expect(screen.getByTestId('schedule-time')).toBeTruthy()
  })

  it('SENIOR 유저에게 지원하기 버튼을 보여준다', () => {
    render(<CareDetailScreen />)
    expect(screen.getByTestId('apply-button')).toBeTruthy()
  })

  it('이미 지원한 SENIOR에게 already-applied-badge를 보여준다', () => {
    mockQueries({ id: 'app-1', senior_id: 'senior-1' })
    render(<CareDetailScreen />)
    expect(screen.getByTestId('already-applied-badge')).toBeTruthy()
  })

  it('PARENT + 내 요청이면 "내가 작성한 요청이에요" 텍스트를 보여준다', () => {
    mockUseAuthStore.mockReturnValue({ userId: 'parent-1', userType: 'PARENT' })
    mockQueries()
    render(<CareDetailScreen />)
    expect(screen.getByText('내가 작성한 요청이에요')).toBeTruthy()
  })

  it('뒤로가기 버튼이 있다', () => {
    render(<CareDetailScreen />)
    expect(screen.getByTestId('back-button')).toBeTruthy()
  })
})
