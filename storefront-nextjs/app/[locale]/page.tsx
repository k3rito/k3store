import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { MobileBottomBar, ProductSearchBar } from './client-components'
import { CartImporter } from './cart-importer'
import { Suspense, Fragment } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { CategoryCard } from '@/components/category-card'
import { GridSkeleton } from '@/components/skeletons'
import { Product, Category } from '@/utils/types'
import { Metadata } from 'next'
import { getCachedSettings } from '@/utils/supabase/queries'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings()
  const headerTitle = settings['header_title'] || 'MedStore'
  return {
    title: `${headerTitle} - Professional Medical Equipment`,
    description: settings['hero_subtitle'] || 'Premium medical e-commerce solution for healthcare professionals.',
  }
}

async function HeroSection({ settings, locale }: { settings: Record<string, string>, locale: string }) {
  const tHome = await getTranslations('Home')
  const heroImage = settings['hero_image'] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA588kmX3DwQmk8CXW0UBebTd55zzzhpA7mMy0ju3f0kv_c8ix9FzrrrgA9f3va_PFneZYJz2F-ZyfvdJgwFY6UXBSf06L8REpaxm9ppZev9Ut6_9_ZfA1I5rcJbLsgB6se5hQGpwIbaVNJSUr6_n0Q8BE5l7l5awJ_VBBzTEEBIENQtZbnrVAm0jbGIEPBwHvCPkTZHlhXl-RWE0blFZelR_qoOpXGD5As0asfd8vt8QL3-9VyrfoXPb93TKh0AC3NLo5Ccak8uPo'
  const heroTitle = settings['hero_title'] || 'Professional Medical Solutions for Clinics'
  const heroSubtitle = settings['hero_subtitle'] || tHome('heroSubtitle')

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-[2rem] min-h-[500px] bg-slate-900 flex items-center shadow-2xl">
        <Image
          alt="Hero background"
          src={heroImage}
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-center px-8 md:px-20 w-full h-full">
          <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 bg-primary/10 w-fit px-4 py-2 rounded-full border border-primary/20 backdrop-blur-md">
            {tHome('exclusiveOffer')}
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white max-w-2xl leading-[1.1] mb-6 whitespace-pre-line">
            {heroTitle.split('\n').map((line: string, i: number) => (
              <Fragment key={i}>
                {line}
                {i < heroTitle.split('\n').length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="text-slate-300 text-lg mt-4 max-w-lg hidden md:block leading-relaxed mb-10">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/${locale}/products`} className="bg-primary hover:bg-primary/90 text-white font-bold py-5 px-10 rounded-2xl transition-all shadow-lg shadow-primary/30 active:scale-95 text-center">
              {tHome('shopNow')}
            </Link>
            <Link href={`/${locale}/contact`} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-5 px-10 rounded-2xl transition-all border border-white/20 active:scale-95 text-center">
              {tHome('bulkQuotes')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

async function HomeContent({ locale }: { locale: string }) {
  const tHome = await getTranslations('Home')

  const { 
    getCachedSettings, 
    getCachedCategories, 
    getCachedProducts 
  } = await import('@/utils/supabase/queries')
  
  const [settings, categories, allProducts] = await Promise.all([
    getCachedSettings(),
    getCachedCategories(),
    getCachedProducts()
  ])

  const featuredProducts = (allProducts as Product[]).slice(0, 4)
  const topCategories = (categories as Category[]).slice(0, 6)
  const b2bImage = settings['b2b_image'] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOZyXTw6FlU0gwaQi-JET6eowfu63YiKHr2MblZ6iuQa_5DzGnvYf4xuBivWm2mp2SnIfFSV87byX2CP60x5wIRiIKvltfd71kT7wqAYDbckYy9Xz0ffn5oF_KjbxMG7Ym4nBpLq5gaXaKYc0Msn6jjwZZK-ekYPbdQWlUiJgEx6Ylu7OXqTMd_gdQlugup0tBhCpCXTmWaJq1vlBXM2nGSNag7C66TrTfwuaM58_--o7SqguFb4Krl1Xd1eSuCX4m0l-74POf2XI'
  const b2bTitle = settings['b2b_title'] || 'Equip Your Entire Medical Facility'
  const b2bSubtitle = settings['b2b_subtitle'] || 'Get wholesale pricing, dedicated account managers, and priority fulfillment for hospitals, clinics, and government agencies.'

  return (
    <>
      <HeroSection settings={settings} locale={locale} />

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h3 className="text-3xl font-black mb-2">{tHome('shopByCategory')}</h3>
            <div className="h-1.5 w-16 bg-primary rounded-full"></div>
          </div>
          <Link href={`/${locale}/categories`} className="text-primary font-bold hover:underline flex items-center gap-1 group">
            {tHome('viewAllCategories')}
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {topCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} locale={locale} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black mb-2">{tHome('bestSellers')}</h3>
              <div className="h-1.5 w-16 bg-primary rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((prod, i) => (
                <ProductCard key={prod.id} product={prod} locale={locale} isHot={i === 0} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-500 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] border-dashed">
                <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">production_quantity_limits</span>
                <p className="font-medium text-lg">No products available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* B2B Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-slate-950 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <div className="flex-1 p-10 md:p-16 lg:p-20 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full w-fit mb-8 border border-primary/20">
              <span className="material-symbols-outlined text-sm">business</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{tHome('b2bPortal')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight whitespace-pre-line">
              {b2bTitle.split('\n').map((line: string, i: number) => (
                <Fragment key={i}>
                  {line}
                  {i < b2bTitle.split('\n').length - 1 && <br />}
                </Fragment>
              ))}
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              {b2bSubtitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <span className="text-sm font-bold text-slate-300">{tHome('certifiedEquipment')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <span className="text-sm font-bold text-slate-300">{tHome('globalLogistics')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined">contract</span>
                </div>
                <span className="text-sm font-bold text-slate-300">{tHome('bulkDiscounts')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <span className="text-sm font-bold text-slate-300">{tHome('techSupport')}</span>
              </div>
            </div>
            <Link href={`/${locale}/b2b`} className="bg-primary hover:bg-primary/90 text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-lg shadow-primary/30 w-fit active:scale-95">{tHome('joinB2B')}</Link>
          </div>
          <div className="flex-1 bg-slate-900 relative min-h-[400px]">
            <Image
              alt="Hospital facility"
              src={b2bImage}
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-slate-950 to-transparent" />
          </div>
        </div>
      </section>
    </>
  )
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const tHome = await getTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={null}><CartImporter /></Suspense>
      
      <Header locale={locale} />
      
      {/* Search Bar Section */}
      <div className="bg-white dark:bg-slate-900 px-4 py-6 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto">
          <ProductSearchBar />
        </div>
      </div>

      <main className="flex-grow">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-[500px] bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse mb-16" />
            <GridSkeleton count={6} type="category" />
            <div className="mt-20">
              <GridSkeleton count={4} type="product" />
            </div>
          </div>
        }>
          <HomeContent locale={locale} />
        </Suspense>

        {/* Newsletter */}
        <section className="max-w-7xl mx-auto px-4 pb-24">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 md:p-20 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-full" />

            <h3 className="text-3xl font-black mb-4">{tHome('newsletter')}</h3>
            <p className="text-slate-500 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">{tHome('newsletterSubtitle')}</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input className="flex-1 px-8 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/30 rounded-2xl focus:ring-0 outline-none transition-all text-sm" placeholder={tHome('emailPlaceholder')} type="email" required />
              <button className="bg-slate-950 dark:bg-primary text-white font-bold px-10 py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-950/10 dark:shadow-primary/20">{tHome('subscribe')}</button>
            </form>
          </div>
        </section>
      </main>
      
      <Footer locale={locale} />

      <MobileBottomBar user={null} />
    </div>
  );
}
