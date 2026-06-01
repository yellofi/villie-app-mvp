import { supabase } from '../lib/supabase'
import type { CareRequest, TargetAge } from '@villie/shared'
import { FEED_RADIUS_METERS } from '@villie/shared'

/**
 * TD-03 해결 전 임시 좌표 (서울 강남구 중심)
 * GPS 동네 인증 구현 후 user_locations에서 읽어온 좌표로 교체
 */
export const MOCK_LAT = 37.4979
export const MOCK_LNG = 127.0276
export const MOCK_B_CODE = '1168010100' // 강남구 대치동

// ────────────────────────────────────────────────
// 피드 조회
// ────────────────────────────────────────────────

/**
 * 반경 내 돌봄 요청 피드 조회
 *
 * RPC get_care_feed가 있으면: PostGIS 기반 위치 필터 + 4단계 정렬
 * RPC 없으면 (migration 미적용): 단순 테이블 쿼리 fallback
 *   → is_urgent DESC, created_at DESC 정렬 (거리 필터 없음)
 *
 * TODO: supabase/migrations/20260531000001_rpc_feed.sql 를
 *       Supabase 대시보드 SQL Editor에서 실행하면 RPC 활성화됨
 */
export async function getFeed(params?: {
  lat?: number
  lng?: number
}): Promise<CareRequest[]> {
  const rpcResult = await supabase.rpc('get_care_feed', {
    p_lat: params?.lat ?? null,
    p_lng: params?.lng ?? null,
    p_radius_meters: FEED_RADIUS_METERS,
  })

  // RPC가 없으면 단순 테이블 쿼리로 fallback
  if (rpcResult.error?.code === 'PGRST202' || rpcResult.error?.message?.includes('404')) {
    const { data, error } = await supabase
      .from('care_requests')
      .select('*')
      .eq('status', 'RECRUITING')
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data ?? []) as CareRequest[]
  }

  if (rpcResult.error) throw rpcResult.error
  return (rpcResult.data ?? []) as CareRequest[]
}

// ────────────────────────────────────────────────
// 단일 요청 조회
// ────────────────────────────────────────────────

export async function getCareRequest(id: string): Promise<CareRequest | null> {
  const { data, error } = await supabase
    .from('care_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

// ────────────────────────────────────────────────
// 돌봄 요청 작성 (부모용)
// ────────────────────────────────────────────────

export interface CreateCareRequestParams {
  parent_id: string
  title: string
  target_age: TargetAge
  hourly_wage: number
  schedule_time: string
  tasks: string[]
  is_urgent: boolean
  /** TD-03 후 GPS 좌표로 교체 */
  lat?: number
  lng?: number
  b_code?: string
}

export async function createCareRequest(
  params: CreateCareRequestParams
): Promise<CareRequest> {
  const lat = params.lat ?? MOCK_LAT
  const lng = params.lng ?? MOCK_LNG
  const b_code = params.b_code ?? MOCK_B_CODE

  const { data, error } = await supabase
    .from('care_requests')
    .insert({
      parent_id: params.parent_id,
      title: params.title,
      target_age: params.target_age,
      hourly_wage: params.hourly_wage,
      schedule_time: params.schedule_time,
      tasks: params.tasks,
      is_urgent: params.is_urgent,
      b_code,
      // PostgREST가 EWKT 형식을 geography 타입으로 파싱
      location: `SRID=4326;POINT(${lng} ${lat})`,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ────────────────────────────────────────────────
// 내가 쓴 요청 목록 (부모용)
// ────────────────────────────────────────────────

export async function getMyRequests(parentId: string): Promise<CareRequest[]> {
  const { data, error } = await supabase
    .from('care_requests')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
