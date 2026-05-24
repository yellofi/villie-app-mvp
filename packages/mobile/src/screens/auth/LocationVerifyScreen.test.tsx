/**
 * LocationVerifyScreen.test.tsx
 *
 * Phase 1 placeholder — 동네 인증 화면 테스트
 *
 * 현재 구현:
 *   - "동네 인증" 헤딩 렌더
 *   - "개발 중 — 건너뛰기" 버튼: setAuthenticated(userId ?? 'dev-user') 호출
 */

import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { LocationVerifyScreen } from './LocationVerifyScreen'
import { useAuthStore } from '../../store/auth.store'

// ---------------------------------------------------------------------------
// Navigation mock
// ---------------------------------------------------------------------------
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}))

// ---------------------------------------------------------------------------
// Auth store mock
// ---------------------------------------------------------------------------
jest.mock('../../store/auth.store')

const mockSetAuthenticated = jest.fn()

function setupStoreMock(userId: string | null = null) {
  ;(useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
    phone: '',
    isAuthenticated: false,
    userId,
    userType: 'PARENT',
    isLoading: false,
    error: null,
    setPhone: jest.fn(),
    setUserType: jest.fn(),
    setAuthenticated: mockSetAuthenticated,
    reset: jest.fn(),
  } as any)
}

beforeEach(() => {
  jest.clearAllMocks()
  setupStoreMock()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('LocationVerifyScreen', () => {
  it('"동네 인증" 헤딩을 렌더한다', () => {
    render(<LocationVerifyScreen />)
    expect(screen.getByText('동네 인증')).toBeTruthy()
  })

  it('"개발 중 — 건너뛰기" 버튼을 렌더한다', () => {
    render(<LocationVerifyScreen />)
    expect(screen.getByText('개발 중 — 건너뛰기')).toBeTruthy()
  })

  it('userId가 null이면 건너뛰기 버튼 클릭 시 setAuthenticated("dev-user")를 호출한다', () => {
    setupStoreMock(null)
    render(<LocationVerifyScreen />)

    fireEvent.press(screen.getByText('개발 중 — 건너뛰기'))

    expect(mockSetAuthenticated).toHaveBeenCalledTimes(1)
    expect(mockSetAuthenticated).toHaveBeenCalledWith('dev-user')
  })

  it('userId가 있으면 건너뛰기 버튼 클릭 시 setAuthenticated(userId)를 호출한다', () => {
    setupStoreMock('user-abc')
    render(<LocationVerifyScreen />)

    fireEvent.press(screen.getByText('개발 중 — 건너뛰기'))

    expect(mockSetAuthenticated).toHaveBeenCalledTimes(1)
    expect(mockSetAuthenticated).toHaveBeenCalledWith('user-abc')
  })

  it('안내 문구를 렌더한다', () => {
    render(<LocationVerifyScreen />)
    expect(screen.getByText(/내 동네를 인증하면/)).toBeTruthy()
  })
})
