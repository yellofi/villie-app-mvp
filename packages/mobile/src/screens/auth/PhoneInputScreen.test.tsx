/**
 * PhoneInputScreen.test.tsx
 *
 * TDD Red Phase — these tests define the contract for PhoneInputScreen.
 * They will FAIL until the screen implementation is complete.
 *
 * Expected testIDs on the screen:
 *   - "phone-input"   : the TextInput for phone number entry
 *   - "submit-button" : the TouchableOpacity/Pressable that triggers OTP send
 *   - "error-message" : Text element shown when signInWithOtp fails
 */

import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native'
import { PhoneInputScreen } from './PhoneInputScreen'

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
const mockSignInWithOtp = supabase.auth.signInWithOtp as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('PhoneInputScreen', () => {
  it('renders phone input and next button', () => {
    render(<PhoneInputScreen />)

    expect(screen.getByTestId('phone-input')).toBeTruthy()
    expect(screen.getByTestId('submit-button')).toBeTruthy()
  })

  it('next button is disabled when phone is empty', () => {
    render(<PhoneInputScreen />)

    const button = screen.getByTestId('submit-button')
    // Button must have disabled prop or accessibilityState.disabled = true
    expect(button.props.disabled ?? button.props.accessibilityState?.disabled).toBe(true)
  })

  it('next button is disabled when phone is invalid ("0101234")', () => {
    render(<PhoneInputScreen />)

    fireEvent.changeText(screen.getByTestId('phone-input'), '0101234')

    const button = screen.getByTestId('submit-button')
    expect(button.props.disabled ?? button.props.accessibilityState?.disabled).toBe(true)
  })

  it('next button is enabled when phone is valid ("010-1234-5678")', () => {
    render(<PhoneInputScreen />)

    fireEvent.changeText(screen.getByTestId('phone-input'), '010-1234-5678')

    const button = screen.getByTestId('submit-button')
    // disabled should be falsy (false or undefined)
    expect(button.props.disabled ?? button.props.accessibilityState?.disabled).toBeFalsy()
  })

  it('calls signInWithOtp with normalized phone on submit', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ data: {}, error: null })

    render(<PhoneInputScreen />)

    fireEvent.changeText(screen.getByTestId('phone-input'), '010-1234-5678')
    fireEvent.press(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({ phone: '+821012345678' })
    })
  })

  it('navigates to OtpVerify after successful OTP send', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ data: {}, error: null })

    render(<PhoneInputScreen />)

    fireEvent.changeText(screen.getByTestId('phone-input'), '010-1234-5678')
    fireEvent.press(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OtpVerify', { phone: '010-1234-5678' })
    })
  })

  it('shows error message when signInWithOtp fails', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({
      data: null,
      error: { message: '전송 실패' },
    })

    render(<PhoneInputScreen />)

    fireEvent.changeText(screen.getByTestId('phone-input'), '010-1234-5678')
    fireEvent.press(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeTruthy()
      expect(screen.getByTestId('error-message').props.children).toContain('전송 실패')
    })
  })
})
