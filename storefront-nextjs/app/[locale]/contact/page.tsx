import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileBottomBar } from '@/app/[locale]/client-components'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import { getCachedSettings } from '@/utils/supabase/queries'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings()
  const headerTitle = settings['header_title'] || 'MedStore'
  return {
    title: `Contact Us | ${headerTitle}`,
    description: 'Get in touch with our team for any medical equipment inquiries or support.',
  }
}

export default async function ContactPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const tContact = await getTranslations('Contact')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-grow max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-3">{tContact('title')}</h1>
          <p className="text-slate-500 text-lg">{tContact('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm">
            <form className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{tContact('name')}</label>
                <input type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{tContact('email')}</label>
                <input type="email" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{tContact('message')}</label>
                <textarea rows={5} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-900 dark:text-white"></textarea>
              </div>
              <button type="submit" className="w-full bg-primary text-white font-black py-4 px-6 rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95">
                {tContact('send')}
              </button>
            </form>
          </div>

          <div className="space-y-6 flex flex-col justify-center">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <span className="material-symbols-outlined text-2xl">call</span>
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-1">{tContact('phone')}</h3>
                  <p className="text-slate-700 dark:text-slate-200 font-bold text-lg tracking-tight">+1 (800) MED-STORE</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-1">{tContact('address')}</h3>
                  <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{tContact('addressValue')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <span className="material-symbols-outlined text-2xl">schedule</span>
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-1">{tContact('hours')}</h3>
                  <p className="text-slate-700 dark:text-slate-200 font-bold">{tContact('hoursValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
      <MobileBottomBar user={user ? { id: user.id, email: user.email } : null} />
    </div>
  )
}
