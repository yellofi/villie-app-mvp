/**
 * CareRequestCard.test.tsx — TDD Red Phase
 *
 * 돌봄 요청 카드 컴포넌트 계약:
 *   - 제목(title) 렌더
 *   - 연령대 레이블 렌더 (TARGET_AGE_LABEL 기반)
 *   - 시급 "시급 N원" 포맷으로 렌더
 *   - 희망 일정(schedule_time) 렌더
 *   - is_urgent=true → 🚨 뱃지 표시
 *   - is_urgent=false → 🚨 없음
 *   - distance_meters 있으면 formatDistance 결과 렌더
 *   - onPress 콜백 호출
 */

import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { CareRequestCard } from './CareRequestCard'
import type { CareRequest } from '@villie/shared'

const baseRequest: CareRequest = {
  id: 'req-1',
  parent_id: 'parent-1',
  title: '하원 후 2시간 돌봄 부탁드려요',
  target_age: 'TODDLER',
  hourly_wage: 13000,
  schedule_time: '월, 수 16:00~18:00',
  tasks: ['하원', '간식 챙기기'],
  is_urgent: false,
  boosted_until: null,
  status: 'RECRUITING',
  b_code: '1168010100',
  created_at: '2026-05-25T10:00:00Z',
}

describe('CareRequestCard', () => {
  it('제목을 렌더한다', () => {
    render(<CareRequestCard request={baseRequest} onPress={() => {}} />)
    expect(screen.getByText('하원 후 2시간 돌봄 부탁드려요')).toBeTruthy()
  })

  it('연령대 레이블을 렌더한다 (TODDLER → 유아)', () => {
    render(<CareRequestCard request={baseRequest} onPress={() => {}} />)
    expect(screen.getByText(/유아/)).toBeTruthy()
  })

  it('INFANT 연령대 레이블을 렌더한다', () => {
    render(<CareRequestCard request={{ ...baseRequest, target_age: 'INFANT' }} onPress={() => {}} />)
    expect(screen.getByText(/영유아/)).toBeTruthy()
  })

  it('ELEMENTARY 연령대 레이블을 렌더한다', () => {
    render(<CareRequestCard request={{ ...baseRequest, target_age: 'ELEMENTARY' }} onPress={() => {}} />)
    expect(screen.getByText(/초등학생/)).toBeTruthy()
  })

  it('시급을 "시급 13,000원" 포맷으로 렌더한다', () => {
    render(<CareRequestCard request={baseRequest} onPress={() => {}} />)
    expect(screen.getByText('시급 13,000원')).toBeTruthy()
  })

  it('희망 일정을 렌더한다', () => {
    render(<CareRequestCard request={baseRequest} onPress={() => {}} />)
    expect(screen.getByText('월, 수 16:00~18:00')).toBeTruthy()
  })

  it('is_urgent=false 이면 🚨를 표시하지 않는다', () => {
    render(<CareRequestCard request={baseRequest} onPress={() => {}} />)
    expect(screen.queryByText(/🚨/)).toBeNull()
  })

  it('is_urgent=true 이면 🚨 뱃지를 표시한다', () => {
    render(<CareRequestCard request={{ ...baseRequest, is_urgent: true }} onPress={() => {}} />)
    expect(screen.getByText(/🚨/)).toBeTruthy()
  })

  it('distance_meters가 있으면 포맷된 거리를 렌더한다 (300m → 도보 5분)', () => {
    render(
      <CareRequestCard
        request={{ ...baseRequest, distance_meters: 300 }}
        onPress={() => {}}
      />,
    )
    expect(screen.getByText('도보 5분')).toBeTruthy()
  })

  it('distance_meters가 없으면 거리를 렌더하지 않는다', () => {
    render(<CareRequestCard request={baseRequest} onPress={() => {}} />)
    expect(screen.queryByText(/도보|km/)).toBeNull()
  })

  it('카드를 누르면 onPress가 해당 request와 함께 호출된다', () => {
    const onPress = jest.fn()
    render(<CareRequestCard request={baseRequest} onPress={onPress} />)
    fireEvent.press(screen.getByText('하원 후 2시간 돌봄 부탁드려요'))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onPress).toHaveBeenCalledWith(baseRequest)
  })
})
