import { supabase } from '../lib/supabase'

export interface CreateReviewParams {
  reviewer_id: string
  reviewee_id: string
  request_id: string
  rating: number
  badges: string[]
  comment?: string
}

export async function createReview(params: CreateReviewParams): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    reviewer_id: params.reviewer_id,
    reviewee_id: params.reviewee_id,
    request_id: params.request_id,
    rating: params.rating,
    badges: params.badges,
    comment: params.comment ?? null,
  })
  if (error) throw error
}
