import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { NicknameInputScreen } from './NicknameInputScreen'

const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}))

const mockSetNickname = jest.fn()
jest.mock('../../store/auth.store', () => ({
  useAuthStore: () => ({ setNickname: mockSetNickname }),
}))

beforeEach(() => jest.clearAllMocks())

describe('NicknameInputScreen', () => {
  it('다음 버튼이 초기에 비활성화되어 있다', () => {
    render(<NicknameInputScreen />)
    const btn = screen.getByTestId('next-button')
    expect(btn.props.accessibilityState?.disabled).toBe(true)
  })

  it('1자 입력 시 버튼이 비활성화된다', () => {
    render(<NicknameInputScreen />)
    fireEvent.changeText(screen.getByTestId('nickname-input'), '가')
    expect(screen.getByTestId('next-button').props.accessibilityState?.disabled).toBe(true)
  })

  it('2자 이상 입력 시 버튼이 활성화된다', () => {
    render(<NicknameInputScreen />)
    fireEvent.changeText(screen.getByTestId('nickname-input'), '홍길동')
    expect(screen.getByTestId('next-button').props.accessibilityState?.disabled).toBe(false)
  })

  it('다음 버튼 클릭 시 setNickname 호출 후 LocationVerify로 이동한다', () => {
    render(<NicknameInputScreen />)
    fireEvent.changeText(screen.getByTestId('nickname-input'), '홍길동')
    fireEvent.press(screen.getByTestId('next-button'))
    expect(mockSetNickname).toHaveBeenCalledWith('홍길동')
    expect(mockNavigate).toHaveBeenCalledWith('LocationVerify')
  })

  it('앞뒤 공백을 제거하고 저장한다', () => {
    render(<NicknameInputScreen />)
    fireEvent.changeText(screen.getByTestId('nickname-input'), '  빌리  ')
    fireEvent.press(screen.getByTestId('next-button'))
    expect(mockSetNickname).toHaveBeenCalledWith('빌리')
  })
})
