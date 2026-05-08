import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileBottomBar } from '@/app/[locale]/client-components'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import { getCachedSettings } from '@/utils/supabase/queries'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const settings = await getCachedSettings()
  const headerTitle = settings['header_title'] || 'MedStore'
  return {
    title: `About Us | ${headerTitle}`,
    description: 'Learn more about MedStore, your trusted partner in medical equipment and supplies since 2010.',
  }
}

export default async function AboutPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const tAbout = await getTranslations('About')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-grow">
        <section className="bg-primary/5 py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6">{tAbout('title')}</h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">{tAbout('subtitle')}</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{tAbout('mission')}</h2>
              <p className="text-slate-500 leading-relaxed mb-8">{tAbout('missionText')}</p>

              <h2 className="text-3xl font-bold mb-6">{tAbout('vision')}</h2>
              <p className="text-slate-500 leading-relaxed">{tAbout('visionText')}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 rounded-[2rem] aspect-square flex items-center justify-center p-12 border border-slate-200 dark:border-slate-800">
               <span className="material-symbols-outlined text-[120px] text-primary/20">medical_information</span>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">{tAbout('whyChooseUs')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'verified', title: tAbout('certified'), desc: tAbout('certifiedDesc'), color: 'bg-green-100 text-green-600' },
              { icon: 'public', title: tAbout('globalShipping'), desc: tAbout('globalShippingDesc'), color: 'bg-blue-100 text-blue-600' },
              { icon: 'support_agent', title: tAbout('support'), desc: tAbout('supportDesc'), color: 'bg-purple-100 text-purple-600' },
              { icon: 'workspace_premium', title: tAbout('warranty'), desc: tAbout('warrantyDesc'), color: 'bg-amber-100 text-amber-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center hover:shadow-md transition-shadow">
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

      <Footer locale={locale} />
      <MobileBottomBar user={user ? { id: user.id, email: user.email } : null} />
    </div>
  )
}
