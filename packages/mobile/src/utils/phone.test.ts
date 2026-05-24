import { formatPhone, normalizePhone, isValidPhone } from './phone'

describe('formatPhone', () => {
  it('"01012345678" → "010-1234-5678"', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678')
  })

  it('"010 1234 5678" → "010-1234-5678"', () => {
    expect(formatPhone('010 1234 5678')).toBe('010-1234-5678')
  })

  it('"010-1234-5678" → "010-1234-5678" (이미 포맷된 경우)', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678')
  })
})

describe('normalizePhone', () => {
  it('"010-1234-5678" → "+821012345678"', () => {
    expect(normalizePhone('010-1234-5678')).toBe('+821012345678')
  })

  it('"01012345678" → "+821012345678"', () => {
    expect(normalizePhone('01012345678')).toBe('+821012345678')
  })

  it('"010 1234 5678" → "+821012345678"', () => {
    expect(normalizePhone('010 1234 5678')).toBe('+821012345678')
  })
})

describe('isValidPhone', () => {
  it('"010-1234-5678" → true', () => {
    expect(isValidPhone('010-1234-5678')).toBe(true)
  })

  it('"01012345678" → true', () => {
    expect(isValidPhone('01012345678')).toBe(true)
  })

  it('"011-1234-5678" → false (010만 허용)', () => {
    expect(isValidPhone('011-1234-5678')).toBe(false)
  })

  it('"010-123-5678" → false (자릿수 오류)', () => {
    expect(isValidPhone('010-123-5678')).toBe(false)
  })

  it('"010-1234-567" → false (자릿수 오류)', () => {
    expect(isValidPhone('010-1234-567')).toBe(false)
  })

  it('"" → false', () => {
    expect(isValidPhone('')).toBe(false)
  })

  it('"abc" → false', () => {
    expect(isValidPhone('abc')).toBe(false)
  })
})
