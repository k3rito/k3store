'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const { locale } = useParams<{ locale: string }>()
  const tAbout = useTranslations('About')
  const tNav = useTranslations('Navigation')

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

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="bg-primary p-3 rounded-2xl text-white inline-block mb-6 shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-4xl">medical_services</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3">{tAbout('title')}</h1>
          <p className="text-slate-500 max-w-xl mx-auto">{tAbout('subtitle')}</p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-4">
              <span className="material-symbols-outlined">flag</span>
            </div>
            <h2 className="text-xl font-bold mb-3">{tAbout('mission')}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{tAbout('missionText')}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-fit mb-4">
              <span className="material-symbols-outlined">visibility</span>
            </div>
            <h2 className="text-xl font-bold mb-3">{tAbout('vision')}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{tAbout('visionText')}</p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{tAbout('whyChooseUs')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'verified', title: tAbout('certified'), desc: tAbout('certifiedDesc'), color: 'bg-green-100 text-green-600' },
              { icon: 'local_shipping', title: tAbout('globalShipping'), desc: tAbout('globalShippingDesc'), color: 'bg-blue-100 text-blue-600' },
              { icon: 'support_agent', title: tAbout('support'), desc: tAbout('supportDesc'), color: 'bg-purple-100 text-purple-600' },
              { icon: 'shield', title: tAbout('warranty'), desc: tAbout('warrantyDesc'), color: 'bg-amber-100 text-amber-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className={`p-3 ${item.color} rounded-xl w-fit mx-auto mb-4`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
