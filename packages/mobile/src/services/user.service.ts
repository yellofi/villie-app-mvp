import { supabase } from '../lib/supabase'
import type { User, UserType } from '@villie/shared'

/** 단일 유저 조회 — 세션 복원 시 신규/재방문 분기용 */
export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** 온보딩 완료 시 users 테이블에 저장 (upsert — 중복 방지) */
export async function upsertUser(params: {
  id: string
  phone_number: string
  nickname: string
  user_type: UserType
}): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: params.id,
        phone_number: params.phone_number,
        nickname: params.nickname,
        user_type: params.user_type,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}
