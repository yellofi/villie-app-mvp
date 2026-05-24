/**
 * OtpVerifyScreen.test.tsx
 *
 * TDD Red Phase — these tests define the contract for OtpVerifyScreen.
 * They will FAIL until the screen implementation is complete.
 *
 * Expected testIDs on the screen:
 *   - "otp-input"      : the TextInput for 6-digit OTP entry
 *   - "verify-button"  : the TouchableOpacity/Pressable that triggers verification
 *   - "phone-display"  : Text element showing the phone number from route params
 *   - "error-message"  : Text element shown when verifyOtp fails
 */

import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native'
import { OtpVerifyScreen } from './OtpVerifyScreen'

// ---------------------------------------------------------------------------
// Supabase mock
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
// Helpers
// ---------------------------------------------------------------------------
import { supabase } from '../../lib/supabase'
const mockVerifyOtp = supabase.auth.verifyOtp as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('OtpVerifyScreen', () => {
  it('renders OTP input and verify button', () => {
    render(<OtpVerifyScreen />)

    expect(screen.getByTestId('otp-input')).toBeTruthy()
    expect(screen.getByTestId('verify-button')).toBeTruthy()
  })

  it('shows the phone number from route params', () => {
    render(<OtpVerifyScreen />)

    // The screen should display the phone passed via route params.
    // Accept either the raw "010-1234-5678" or formatted variant.
    const phoneDisplay = screen.getByTestId('phone-display')
    expect(phoneDisplay.props.children).toEqual(
      expect.stringContaining('010'),
    )
  })

  it('verify button disabled when OTP is empty', () => {
    render(<OtpVerifyScreen />)

    const button = screen.getByTestId('verify-button')
    expect(button.props.disabled ?? button.props.accessibilityState?.disabled).toBe(true)
  })

  it('verify button disabled when OTP is less than 6 digits ("12345")', () => {
    render(<OtpVerifyScreen />)

    fireEvent.changeText(screen.getByTestId('otp-input'), '12345')

    const button = screen.getByTestId('verify-button')
    expect(button.props.disabled ?? button.props.accessibilityState?.disabled).toBe(true)
  })

  it('verify button enabled when OTP is 6 digits ("123456")', () => {
    render(<OtpVerifyScreen />)

    fireEvent.changeText(screen.getByTestId('otp-input'), '123456')

    const button = screen.getByTestId('verify-button')
    expect(button.props.disabled ?? button.props.accessibilityState?.disabled).toBeFalsy()
  })

  it('calls verifyOtp with correct params on submit', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    })

    render(<OtpVerifyScreen />)

    fireEvent.changeText(screen.getByTestId('otp-input'), '123456')
    fireEvent.press(screen.getByTestId('verify-button'))

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: '+821012345678',
        token: '123456',
        type: 'sms',
      })
    })
  })

  it('navigates to RoleSelect after successful verification', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    })

    render(<OtpVerifyScreen />)

    fireEvent.changeText(screen.getByTestId('otp-input'), '123456')
    fireEvent.press(screen.getByTestId('verify-button'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('RoleSelect')
    })
  })

  it('shows error when verification fails', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: null,
      error: { message: '인증 실패' },
    })

    render(<OtpVerifyScreen />)

    fireEvent.changeText(screen.getByTestId('otp-input'), '123456')
    fireEvent.press(screen.getByTestId('verify-button'))

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeTruthy()
      expect(screen.getByTestId('error-message').props.children).toContain('인증 실패')
    })
  })
})
