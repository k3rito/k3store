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
    title: `B2B Solutions | ${headerTitle}`,
    description: 'Wholesale medical equipment solutions for hospitals, clinics, and government agencies.',
  }
}

export default async function B2BPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const tHome = await getTranslations('Home')
  const tContact = await getTranslations('Contact')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-grow">
        {/* B2B Hero */}
        <section className="bg-slate-950 py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-5 py-2 rounded-full mb-8 border border-primary/20 backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">business</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tHome('b2bPortal')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">Equip Your Entire Medical Facility</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
              Get wholesale pricing, dedicated account managers, and priority fulfillment for hospitals, clinics, and government agencies.
            </p>
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-3 bg-primary text-white font-black px-10 py-5 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95">
              <span className="material-symbols-outlined">handshake</span>
              {tHome('joinB2B')}
            </Link>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'verified_user', label: tHome('certifiedEquipment'), color: 'bg-green-100 text-green-600', desc: 'All units pass stringent clinical validation' },
              { icon: 'local_shipping', label: tHome('globalLogistics'), color: 'bg-blue-100 text-blue-600', desc: 'Secure worldwide medical-grade shipping' },
              { icon: 'contract', label: tHome('bulkDiscounts'), color: 'bg-purple-100 text-purple-600', desc: 'Volume-based pricing for medical groups' },
              { icon: 'support_agent', label: tHome('techSupport'), color: 'bg-amber-100 text-amber-600', desc: '24/7 technical and clinical assistance' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm text-center hover:shadow-xl transition-all group">
                <div className={`p-4 ${item.color} rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider mb-2">{item.label}</h3>
                <p className="text-slate-400 text-xs font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 pb-24">
          <div className="bg-primary/5 rounded-[3rem] border border-primary/10 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full"></div>
            <h2 className="text-3xl font-black mb-4">{tContact('title')}</h2>
            <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">{tContact('subtitle')}</p>
            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-3 bg-slate-950 text-white font-black px-12 py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-slate-950/20 active:scale-95">
              <span className="material-symbols-outlined text-sm">mail</span>
              {tContact('send')}
            </Link>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
      <MobileBottomBar user={user ? { id: user.id, email: user.email } : null} />
    </div>
  )
}
