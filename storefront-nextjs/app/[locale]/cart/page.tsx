'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function CartPage() {
  const { locale } = useParams<{ locale: string }>()
  const tCart = useTranslations('Cart')
  const tNav = useTranslations('Navigation')

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-symbols-outlined text-xl">medical_services</span>
            </div>
            <span className="text-lg font-bold text-primary">MedStore</span>
          </Link>
          <Link href={`/${locale}`} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {tCart('continueShopping')}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold mb-8">{tCart('title')}</h1>
        
        {/* Empty Cart State */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">shopping_cart</span>
          <h2 className="text-xl font-bold text-slate-500 mb-2">{tCart('empty')}</h2>
          <p className="text-slate-400 mb-8 text-sm">Browse our catalog and add items to get started.</p>
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md">
            <span className="material-symbols-outlined text-sm">storefront</span>
            {tCart('continueShopping')}
          </Link>
        </div>
      </main>
    </div>
  )
}
