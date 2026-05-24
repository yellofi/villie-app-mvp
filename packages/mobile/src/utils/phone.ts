/**
 * 전화번호 관련 유틸리티
 *
 * - formatPhone: 화면 표시용 포맷 (예: "010-1234-5678")
 * - normalizePhone: Supabase Auth용 국제번호 (예: "+821012345678")
 * - isValidPhone: 유효성 검사 (010으로 시작하는 11자리 한국 휴대폰 번호만 허용)
 */

/** 숫자만 추출 */
function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * 화면 표시용 포맷으로 변환
 * "01012345678" | "010 1234 5678" | "010-1234-5678" → "010-1234-5678"
 */
export function formatPhone(raw: string): string {
  const digits = digitsOnly(raw)
  // 한국 011자리 휴대폰: 010-XXXX-XXXX
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  // 자릿수가 맞지 않는 경우 숫자만 반환
  return digits
}

/**
 * Supabase Auth용 국제번호로 변환
 * "010-1234-5678" | "01012345678" | "010 1234 5678" → "+821012345678"
 */
export function normalizePhone(raw: string): string {
  const digits = digitsOnly(raw)
  // 한국 번호: 앞의 0을 제거하고 +82 추가
  if (digits.startsWith('0')) {
    return `+82${digits.slice(1)}`
  }
  return `+${digits}`
}

/**
 * 유효성 검사
 * - 010으로 시작해야 함
 * - 숫자만 합산 시 정확히 11자리여야 함 (010 + 4자리 + 4자리)
 */
export function isValidPhone(raw: string): boolean {
  const digits = digitsOnly(raw)
  return digits.length === 11 && digits.startsWith('010')
}
