/**
 * LocationVerifyScreen.test.tsx
 *
 * handleSkip 우선순위:
 *   1. Supabase 세션의 user.id → upsertUser 호출 + setAuthenticated
 *   2. auth store의 userId → upsertUser 호출 + setAuthenticated
 *   3. 'dev-user' (fallback) → upsertUser 생략 + setAuthenticated
 */

import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native'
import { LocationVerifyScreen } from './LocationVerifyScreen'
import { useAuthStore } from '../../store/auth.store'

// ---------------------------------------------------------------------------
// Supabase mock
// ---------------------------------------------------------------------------
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getSession: jest.fn() },
  },
}))

import { supabase } from '../../lib/supabase'
const mockGetSession = supabase.auth.getSession as jest.Mock

// ---------------------------------------------------------------------------
// user.service mock
// ---------------------------------------------------------------------------
jest.mock('../../services/user.service', () => ({
  upsertUser: jest.fn().mockResolvedValue({ id: 'any' }),
}))

// ---------------------------------------------------------------------------
// Navigation mock
// ---------------------------------------------------------------------------
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}))

// ---------------------------------------------------------------------------
// Auth store mock
// ---------------------------------------------------------------------------
jest.mock('../../store/auth.store')

const mockSetAuthenticated = jest.fn()

function setupStoreMock(userId: string | null = null) {
  ;(useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
    phone: '',
    nickname: '빌리',
    isAuthenticated: false,
    userId,
    userType: 'PARENT',
    isLoading: false,
    error: null,
    setPhone: jest.fn(),
    setNickname: jest.fn(),
    setUserType: jest.fn(),
    setAuthenticated: mockSetAuthenticated,
    reset: jest.fn(),
  } as any)
}

beforeEach(() => {
  jest.clearAllMocks()
  setupStoreMock()
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('LocationVerifyScreen', () => {
  it('"동네 인증" 헤딩을 렌더한다', () => {
    render(<LocationVerifyScreen />)
    expect(screen.getByText('동네 인증')).toBeTruthy()
  })

  it('"지금은 건너뛰기" 버튼을 렌더한다', () => {
    render(<LocationVerifyScreen />)
    expect(screen.getByTestId('skip-button')).toBeTruthy()
    expect(screen.getByText('지금은 건너뛰기')).toBeTruthy()
  })

  it('세션 없고 userId도 없으면 setAuthenticated("dev-user")를 호출한다', async () => {
    setupStoreMock(null)
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null })

    render(<LocationVerifyScreen />)
    fireEvent.press(screen.getByTestId('skip-button'))

    // store에 userType('PARENT')이 있으므로 두 번째 인자로 전달됨
    await waitFor(() => {
      expect(mockSetAuthenticated).toHaveBeenCalledWith('dev-user', 'PARENT')
    })
  })

  it('세션 없고 store에 userId 있으면 setAuthenticated(userId)를 호출한다', async () => {
    setupStoreMock('user-abc')
    mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null })

    render(<LocationVerifyScreen />)
    fireEvent.press(screen.getByTestId('skip-button'))

    await waitFor(() => {
      expect(mockSetAuthenticated).toHaveBeenCalledWith('user-abc', 'PARENT')
    })
  })

  it('Supabase 세션이 있으면 session.user.id로 setAuthenticated를 호출한다', async () => {
    setupStoreMock(null)
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'supabase-user-xyz', phone: '+821012345678' } } },
      error: null,
    })

    render(<LocationVerifyScreen />)
    fireEvent.press(screen.getByTestId('skip-button'))

    await waitFor(() => {
      expect(mockSetAuthenticated).toHaveBeenCalledWith('supabase-user-xyz', 'PARENT')
    })
  })

  it('Supabase 세션 id가 store userId보다 우선순위가 높다', async () => {
    setupStoreMock('store-user')
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'session-user', phone: '+821012345678' } } },
      error: null,
    })

    render(<LocationVerifyScreen />)
    fireEvent.press(screen.getByTestId('skip-button'))

    await waitFor(() => {
      expect(mockSetAuthenticated).toHaveBeenCalledWith('session-user', 'PARENT')
    })
  })

  it('안내 문구를 렌더한다', () => {
    render(<LocationVerifyScreen />)
    expect(screen.getByText(/내 동네를 인증하면/)).toBeTruthy()
  })
})
