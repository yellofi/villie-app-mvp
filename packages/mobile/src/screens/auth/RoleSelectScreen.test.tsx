/**
 * RoleSelectScreen.test.tsx
 *
 * TDD Red Phase — these tests define the contract for RoleSelectScreen.
 * They will FAIL until the screen implementation is complete.
 *
 * Expected testIDs on the screen:
 *   - "role-parent"     : TouchableOpacity/Pressable for selecting PARENT role
 *   - "role-senior"     : TouchableOpacity/Pressable for selecting SENIOR role
 *   - "confirm-button"  : TouchableOpacity/Pressable to confirm role selection
 *
 * Expected button labels (accessible text):
 *   - "부모님"        inside the PARENT option
 *   - "시니어 시터"   inside the SENIOR option
 */

import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { RoleSelectScreen } from './RoleSelectScreen'
import { useAuthStore } from '../../store/auth.store'

// ---------------------------------------------------------------------------
// Supabase mock (required to avoid module resolution errors)
// ---------------------------------------------------------------------------
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
    },
  },
}))

// ---------------------------------------------------------------------------
// Navigation mock
// ---------------------------------------------------------------------------
const mockNavigate = jest.fn()
const mockGoBack = jest.fn()
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { phone: '010-1234-5678' } }),
}))

// ---------------------------------------------------------------------------
// Auth store mock
// ---------------------------------------------------------------------------
jest.mock('../../store/auth.store')

const mockSetUserType = jest.fn()

;(useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
  phone: '010-1234-5678',
  nickname: '',
  isAuthenticated: true,
  userId: 'user-1',
  userType: null,
  isLoading: false,
  error: null,
  setPhone: jest.fn(),
  setNickname: jest.fn(),
  setUserType: mockSetUserType,
  setAuthenticated: jest.fn(),
  reset: jest.fn(),
} as any)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks()
  ;(useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
    phone: '010-1234-5678',
    nickname: '',
    isAuthenticated: true,
    userId: 'user-1',
    userType: null,
    isLoading: false,
    error: null,
    setPhone: jest.fn(),
    setNickname: jest.fn(),
    setUserType: mockSetUserType,
    setAuthenticated: jest.fn(),
    reset: jest.fn(),
  } as any)
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('RoleSelectScreen', () => {
  it('renders PARENT and SENIOR options', () => {
    render(<RoleSelectScreen />)

    expect(screen.getByTestId('role-parent')).toBeTruthy()
    expect(screen.getByTestId('role-senior')).toBeTruthy()
  })

  it('shows 부모님 and 시니어 시터 button labels', () => {
    render(<RoleSelectScreen />)

    expect(screen.getByText('부모님')).toBeTruthy()
    expect(screen.getByText('시니어 시터')).toBeTruthy()
  })

  it('no option selected initially — confirm button disabled', () => {
    render(<RoleSelectScreen />)

    const confirmButton = screen.getByTestId('confirm-button')
    expect(
      confirmButton.props.disabled ?? confirmButton.props.accessibilityState?.disabled,
    ).toBe(true)
  })

  it('selecting PARENT enables confirm button', () => {
    render(<RoleSelectScreen />)

    fireEvent.press(screen.getByTestId('role-parent'))

    const confirmButton = screen.getByTestId('confirm-button')
    expect(
      confirmButton.props.disabled ?? confirmButton.props.accessibilityState?.disabled,
    ).toBeFalsy()
  })

  it('selecting SENIOR enables confirm button', () => {
    render(<RoleSelectScreen />)

    fireEvent.press(screen.getByTestId('role-senior'))

    const confirmButton = screen.getByTestId('confirm-button')
    expect(
      confirmButton.props.disabled ?? confirmButton.props.accessibilityState?.disabled,
    ).toBeFalsy()
  })

  it('calls setUserType with PARENT when parent selected and confirmed', () => {
    render(<RoleSelectScreen />)

    fireEvent.press(screen.getByTestId('role-parent'))
    fireEvent.press(screen.getByTestId('confirm-button'))

    expect(mockSetUserType).toHaveBeenCalledWith('PARENT')
  })

  it('calls setUserType with SENIOR when senior selected and confirmed', () => {
    render(<RoleSelectScreen />)

    fireEvent.press(screen.getByTestId('role-senior'))
    fireEvent.press(screen.getByTestId('confirm-button'))

    expect(mockSetUserType).toHaveBeenCalledWith('SENIOR')
  })
})
