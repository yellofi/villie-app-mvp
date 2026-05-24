import { formatDistance } from './types'

/**
 * TDD: formatDistance 유틸 함수 명세
 *
 * 규칙:
 *   0 ~ 499m  → "도보 N분"  (70m/분 기준, 올림)
 *   500 ~ 999m → "Nm"       (100m 단위 반올림, 단 반올림 결과가 1000이면 km 표기)
 *   1000m ~   → "N.Nkm"
 */

describe('formatDistance', () => {
  // ── 도보 구간 (0 ~ 499m) ──────────────────────────────
  describe('0~499m → 도보 N분', () => {
    it('70m  → 도보 1분', () => expect(formatDistance(70)).toBe('도보 1분'))
    it('100m → 도보 2분', () => expect(formatDistance(100)).toBe('도보 2분'))
    it('300m → 도보 5분', () => expect(formatDistance(300)).toBe('도보 5분'))
    it('499m → 도보 8분', () => expect(formatDistance(499)).toBe('도보 8분'))
  })

  // ── 미터 구간 (500 ~ 949m) ────────────────────────────
  // 반올림 결과가 1000 미만인 경우만 'm' 표기
  describe('500~949m → Nm', () => {
    it('500m → 500m', () => expect(formatDistance(500)).toBe('500m'))
    it('600m → 600m', () => expect(formatDistance(600)).toBe('600m'))
    it('750m → 800m', () => expect(formatDistance(750)).toBe('800m'))
    it('949m → 900m', () => expect(formatDistance(949)).toBe('900m'))
  })

  // ── km 구간 (950m 이상 — 반올림하면 1000m 이상) ──────
  describe('950m~ → N.Nkm', () => {
    it('950m  → 1.0km', () => expect(formatDistance(950)).toBe('1.0km'))
    it('999m  → 1.0km', () => expect(formatDistance(999)).toBe('1.0km'))
    it('1000m → 1.0km', () => expect(formatDistance(1000)).toBe('1.0km'))
    it('1500m → 1.5km', () => expect(formatDistance(1500)).toBe('1.5km'))
    it('3000m → 3.0km', () => expect(formatDistance(3000)).toBe('3.0km'))
  })
})
