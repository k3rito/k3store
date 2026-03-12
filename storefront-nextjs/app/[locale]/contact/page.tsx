'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const { locale } = useParams<{ locale: string }>()
  const tContact = useTranslations('Contact')
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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold mb-2">{tContact('title')}</h1>
          <p className="text-slate-500">{tContact('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{tContact('name')}</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{tContact('email')}</label>
                <input type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{tContact('message')}</label>
                <textarea rows={5} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"></textarea>
              </div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all shadow-md">
                {tContact('send')}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{tContact('phone')}</h3>
                  <p className="text-slate-500 text-sm">+1 (800) MED-STORE</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{tContact('address')}</h3>
                  <p className="text-slate-500 text-sm">{tContact('addressValue')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{tContact('hours')}</h3>
                  <p className="text-slate-500 text-sm">{tContact('hoursValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
