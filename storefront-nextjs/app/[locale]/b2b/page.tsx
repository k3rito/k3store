'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function B2BPage() {
  const { locale } = useParams<{ locale: string }>()
  const tHome = useTranslations('Home')
  const tNav = useTranslations('Navigation')
  const tContact = useTranslations('Contact')

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
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
            {tNav('home')}
          </Link>
        </div>
      </header>

      <main>
        {/* B2B Hero */}
        <section className="bg-slate-900 py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined text-sm">business</span>
              <span className="text-xs font-bold uppercase tracking-wider">{tHome('b2bPortal')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Equip Your Entire Medical Facility</h1>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get wholesale pricing, dedicated account managers, and priority fulfillment for hospitals, clinics, and government agencies.
            </p>
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined">handshake</span>
              {tHome('joinB2B')}
            </Link>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'verified_user', label: tHome('certifiedEquipment'), color: 'bg-green-100 text-green-600' },
              { icon: 'local_shipping', label: tHome('globalLogistics'), color: 'bg-blue-100 text-blue-600' },
              { icon: 'contract', label: tHome('bulkDiscounts'), color: 'bg-purple-100 text-purple-600' },
              { icon: 'support_agent', label: tHome('techSupport'), color: 'bg-amber-100 text-amber-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className={`p-3 ${item.color} rounded-xl w-fit mx-auto mb-4`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="font-bold text-sm">{item.label}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="bg-primary/5 rounded-3xl p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">{tContact('title')}</h2>
            <p className="text-slate-500 mb-8">{tContact('subtitle')}</p>
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all">
              <span className="material-symbols-outlined text-sm">mail</span>
              {tContact('send')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
