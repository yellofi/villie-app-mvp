// ─── 역할 ───────────────────────────────────────
export type UserType = 'PARENT' | 'SENIOR'

// ─── 돌봄 연령대 ─────────────────────────────────
export type TargetAge = 'INFANT' | 'TODDLER' | 'ELEMENTARY'

// ─── 게시글 상태 ─────────────────────────────────
export type RequestStatus = 'RECRUITING' | 'MATCHED' | 'COMPLETED'

// ─── 지원 상태 ───────────────────────────────────
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

// ─── 메시지 타입 (Phase 2 확장 대비) ─────────────
export type MessageType = 'TEXT' // | 'IMAGE' | 'SYSTEM' (Phase 2)

// ─── 피드 정렬 기준 ──────────────────────────────
export const FEED_RADIUS_METERS = 3000 // 기본 반경 3km

// ─── 연령대 레이블 ───────────────────────────────
export const TARGET_AGE_LABEL: Record<TargetAge, string> = {
  INFANT: '영유아 (0~3세)',
  TODDLER: '유아 (4~7세)',
  ELEMENTARY: '초등학생 (8~13세)',
}

// ─── 거리 포맷 유틸 ──────────────────────────────
// 서버에서 미터 단위로 받아 클라이언트에서 표시용 문자열로 변환
// (원시 좌표는 클라이언트에 절대 노출하지 않는다 - SPEC 제약)
export function formatDistance(meters: number): string {
  if (meters < 500) return '도보 ' + Math.ceil(meters / 70) + '분'
  if (meters < 1000) return Math.round(meters / 100) * 100 + 'm'
  return (meters / 1000).toFixed(1) + 'km'
}

// ─── Entity 타입 (API 응답 기준) ─────────────────
export interface User {
  id: string
  phone_number: string
  nickname: string
  user_type: UserType
  avatar_url: string | null
  created_at: string
}

export interface SeniorProfile {
  user_id: string
  total_score: number
  score_infant: number
  score_toddler: number
  score_elementary: number
  verified_badges: string[]
}

export interface CareRequest {
  id: string
  parent_id: string
  title: string
  target_age: TargetAge
  hourly_wage: number
  schedule_time: string
  tasks: string[]
  is_urgent: boolean
  boosted_until: string | null
  status: RequestStatus
  b_code: string
  created_at: string
  // 피드 조회 시 서버에서 추가 (원시 좌표 대신 가공된 거리)
  distance_meters?: number
}

export interface Application {
  id: string
  request_id: string
  senior_id: string
  status: ApplicationStatus
  message: string | null
  applied_at: string
}

export interface MatchChat {
  id: string
  request_id: string
  parent_id: string
  senior_id: string
  agreed_schedule: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface Review {
  id: string
  match_chat_id: string
  reviewer_id: string
  reviewee_id: string
  target_age: TargetAge
  rating: number
  feedback_badges: string[]
  comment: string | null
  created_at: string
}
