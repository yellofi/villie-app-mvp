import { supabase } from '../lib/supabase'

export interface AgeStat {
  avg: number
  count: number
}

export interface SeniorProfile {
  id: string
  nickname: string
  dong?: string | null
  care_count?: number
  age_stats?: Record<string, AgeStat>
  badge_counts?: Record<string, number>
  reviews?: Array<{ rating: number; comment: string; created_at: string }>
}

/**
 * 시니어 프로필 조회
 * users + reviews 조인하여 평점/리뷰 집계
 */
export async function getSeniorProfile(seniorId: string): Promise<SeniorProfile | null> {
  // 기본 유저 정보
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, nickname')
    .eq('id', seniorId)
    .maybeSingle()

  if (userError) throw userError
  if (!user) return null

  // 리뷰 조회
  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('rating, comment, created_at, target_age')
    .eq('reviewee_id', seniorId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (reviewError) throw reviewError

  const reviewList = reviews ?? []

  // 연령대별 평점 집계
  const age_stats: Record<string, AgeStat> = {}
  for (const age of ['INFANT', 'TODDLER', 'ELEMENTARY']) {
    const filtered = reviewList.filter((r: any) => r.target_age === age)
    if (filtered.length > 0) {
      age_stats[age] = {
        avg: filtered.reduce((s: number, r: any) => s + r.rating, 0) / filtered.length,
        count: filtered.length,
      }
    }
  }

  return {
    id: user.id,
    nickname: user.nickname,
    care_count: reviewList.length,
    age_stats,
    reviews: reviewList.map((r: any) => ({
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    })),
  }
}
