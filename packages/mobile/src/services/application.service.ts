import { supabase } from '../lib/supabase'
import type { Application } from '@villie/shared'

/** 시니어 → 돌봄 요청 지원 */
export async function applyToRequest(params: {
  request_id: string
  senior_id: string
  message?: string
}): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      request_id: params.request_id,
      senior_id: params.senior_id,
      message: params.message ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** 내가 이미 지원했는지 확인 */
export async function getMyApplication(
  requestId: string,
  seniorId: string
): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('request_id', requestId)
    .eq('senior_id', seniorId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** 요청에 달린 지원자 목록 (부모용) */
export async function getApplications(requestId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('request_id', requestId)
    .order('applied_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
