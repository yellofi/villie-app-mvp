/**
 * CareFeedScreen.test.tsx — TDD Red Phase
 *
 * 돌봄 요청 피드 화면 계약:
 *   - 화면 헤더 "빌리 피드" 텍스트 렌더
 *   - mock 데이터 기반 카드 목록 렌더
 *   - 급구 카드에 🚨 표시
 *   - 카드 목록이 비어있으면 빈 상태 문구 표시
 */

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { CareFeedScreen } from './CareFeedScreen'

// navigation mock
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}))

describe('CareFeedScreen', () => {
  it('헤더 "빌리 피드" 텍스트를 렌더한다', () => {
    render(<CareFeedScreen />)
    expect(screen.getByText('빌리 피드')).toBeTruthy()
  })

  it('mock 데이터 카드들을 렌더한다 (적어도 1개 이상)', () => {
    render(<CareFeedScreen />)
    // CareRequestCard는 제목 텍스트를 렌더하므로, 카드가 1개 이상이면 제목이 보인다
    const titles = screen.getAllByTestId('care-request-card')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('mock 데이터에 급구 게시글이 있으면 🚨를 표시한다', () => {
    render(<CareFeedScreen />)
    // MOCK_REQUESTS 중 하나는 is_urgent=true 이어야 한다
    const urgentBadges = screen.getAllByText(/🚨/)
    expect(urgentBadges.length).toBeGreaterThan(0)
  })
})
