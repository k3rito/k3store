'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useLoading } from '@/components/providers'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles?: { full_name: string }
}

export function ReviewsSystem({ productId, userId }: { productId: string, userId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const { setIsLoading } = useLoading()

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    
    if (!error && data) setReviews(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      alert('Please login to leave a review.')
      return
    }
    
    setSubmitting(true)
    setIsLoading(true)
    
    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        profile_id: userId,
        rating,
        comment
      })
    
    if (error) {
      alert(error.message)
    } else {
      setComment('')
      fetchReviews()
    }
    
    setSubmitting(false)
    setIsLoading(false)
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-bold">Customer Reviews ({reviews.length})</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-500">
            <span className="material-symbols-outlined text-lg">star</span>
            <span className="font-bold">{reviews.length > 0 ? (reviews.reduce((a,b) => a+b.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
          </div>
          <span className="text-sm text-slate-400">Average Rating</span>
        </div>
      </div>

      {userId && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">rate_review</span>
            Leave a Review
          </h4>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`material-symbols-outlined text-2xl transition-all ${star <= rating ? 'text-amber-500 fill-current scale-110' : 'text-slate-300'}`}
              >
                star
              </button>
            ))}
            <span className="text-xs font-bold text-slate-500 ml-2 uppercase">Your Rating</span>
          </div>

          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this medical equipment..."
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm min-h-[100px]"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">forum</span>
            <p className="text-slate-400 text-sm italic">No reviews yet. Be the first to share your feedback!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">{review.profiles?.full_name || 'Anonymous'}</p>
                  <p className="text-[10px] text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`material-symbols-outlined text-sm ${star <= review.rating ? 'text-amber-500' : 'text-slate-200'}`}>
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm italic leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
