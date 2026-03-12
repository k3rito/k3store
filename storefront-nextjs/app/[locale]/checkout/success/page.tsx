'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const { locale } = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-8 text-center">
        {/* Success Animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-4xl">check</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Order Placed!</h1>
        <p className="text-slate-500 text-sm mb-6">Your order has been submitted and is being processed.</p>

        {orderId && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Order ID</p>
            <p className="font-mono text-sm font-bold text-primary break-all">{orderId}</p>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
          <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
          <div>
            <p className="text-sm font-bold text-primary">What happens next?</p>
            <p className="text-xs text-primary/80 mt-1">Our team will review your order and contact you to confirm delivery details. You&apos;ll receive updates via email.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/${locale}`} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">home</span> Back to Home
          </Link>
          <Link href={`/${locale}`} className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">shopping_bag</span> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
