import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SidebarDrawer, HeaderActions, MobileBottomBar, ProductSearchBar } from './client-components'
import { AddToCartButton } from './cart-components'

export const revalidate = 0

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const tNav = await getTranslations('Navigation');
  const tHome = await getTranslations('Home');
  const tFooter = await getTranslations('Footer');
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'user'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) userRole = profile.role
  }

  // Fetch CMS Settings
  const { data: settingsData } = await supabase.from('site_settings').select('*')
  const settings = settingsData?.reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value || ''
    return acc
  }, {}) || {}

  // Fetch Categories & Products
  const { data: categories } = await supabase.from('categories').select('*').eq('status', 'active').order('display_order')
  const { data: products } = await supabase.from('products').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(4)

  // Fallback Values for CMS
  const headerTitle = settings['header_title'] || 'MedStore'
  const heroImage = settings['hero_image'] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA588kmX3DwQmk8CXW0UBebTd55zzzhpA7mMy0ju3f0kv_c8ix9FzrrrgA9f3va_PFneZYJz2F-ZyfvdJgwFY6UXBSf06L8REpaxm9ppZev9Ut6_9_ZfA1I5rcJbLsgB6se5hQGpwIbaVNJSUr6_n0Q8BE5l7l5awJ_VBBzTEEBIENQtZbnrVAm0jbGIEPBwHvCPkTZHlhXl-RWE0blFZelR_qoOpXGD5As0asfd8vt8QL3-9VyrfoXPb93TKh0AC3NLo5Ccak8uPo'
  const heroTitle = settings['hero_title'] || 'Professional Medical Solutions for Clinics'
  const heroSubtitle = settings['hero_subtitle'] || tHome('heroSubtitle')
  const b2bImage = settings['b2b_image'] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOZyXTw6FlU0gwaQi-JET6eowfu63YiKHr2MblZ6iuQa_5DzGnvYf4xuBivWm2mp2SnIfFSV87byX2CP60x5wIRiIKvltfd71kT7wqAYDbckYy9Xz0ffn5oF_KjbxMG7Ym4nBpLq5gaXaKYc0Msn6jjwZZK-ekYPbdQWlUiJgEx6Ylu7OXqTMd_gdQlugup0tBhCpCXTmWaJq1vlBXM2nGSNag7C66TrTfwuaM58_--o7SqguFb4Krl1Xd1eSuCX4m0l-74POf2XI'
  const b2bTitle = settings['b2b_title'] || 'Equip Your Entire Medical Facility'
  const b2bSubtitle = settings['b2b_subtitle'] || 'Get wholesale pricing, dedicated account managers, and priority fulfillment for hospitals, clinics, and government agencies.'

  // Helper to pick localized name
  const localName = (item: any) => locale === 'ar' ? (item.name_ar || item.name_en) : item.name_en
  const localDesc = (item: any) => locale === 'ar' ? (item.description_ar || item.description_en) : item.description_en

  return (
    <>
      {/* Header & Navigation */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Menu Trigger — CLIENT COMPONENT for interactivity */}
            <div className="flex items-center gap-4">
              <SidebarDrawer user={user ? { id: user.id, email: user.email } : null} userRole={userRole} />
              <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">medical_services</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-primary">{headerTitle}</h1>
              </Link>
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-bold border-b-2 border-primary pb-1" href={`/${locale}`}>{tNav('home')}</Link>
              <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href={`/${locale}/about`}>{tNav('about')}</Link>
              <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href={`/${locale}/contact`}>{tNav('contact')}</Link>
              <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href={`/${locale}/b2b`}>{tNav('b2b')}</Link>
            </nav>
            {/* Actions — CLIENT COMPONENT for interactivity */}
            <HeaderActions user={user ? { id: user.id, email: user.email } : null} userRole={userRole} />
          </div>
        </div>
      </header>
      
      {/* Search Bar Section — Task 3: Product-only search */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <ProductSearchBar />
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl aspect-[21/9] bg-slate-800 flex items-center">
          <img alt="Hero background" className="absolute inset-0 w-full h-full object-cover opacity-60" src={heroImage} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex flex-col justify-center px-8 md:px-16 w-full h-full">
            <span className="text-white/80 font-bold tracking-widest text-xs uppercase mb-2">{tHome('exclusiveOffer')}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white max-w-lg leading-tight" dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, '<br />') }}>
            </h2>
            <p className="text-white/90 mt-4 max-w-md hidden md:block">
              {heroSubtitle}
            </p>
            <div className="mt-8 flex gap-4">
              <Link href={`/${locale}/categories`} className="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-lg">{tHome('shopNow')}</Link>
              <Link href={`/${locale}/b2b`} className="bg-primary/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-lg font-bold hover:bg-primary/40 transition-all">{tHome('bulkQuotes')}</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold">{tHome('shopByCategory')}</h3>
            <div className="h-1 w-12 bg-primary mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories && categories.length > 0 ? (
            categories.map((cat: any, i: number) => (
              <Link href={`/${locale}/categories/${cat.id}`} key={cat.id || i} className="group cursor-pointer block">
                <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 mb-3 group-hover:shadow-md transition-shadow">
                  {cat.image_url ? (
                    <img alt={localName(cat)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={cat.image_url} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-center text-sm md:text-base">{localName(cat)}</h4>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inventory_2</span>
              <p>No categories found.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Best Sellers */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">{tHome('bestSellers')}</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products.map((prod: any, i: number) => (
                <div key={prod.id || i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="relative mb-4">
                    {i === 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">{tHome('hotSale')}</span>}
                    {prod.image_url ? (
                      <img alt={localName(prod)} className="w-full h-48 object-contain relative z-0" src={prod.image_url} />
                    ) : (
                      <div className="w-full h-48 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-lg">
                        <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map((star) => (
                      <span key={star} className={`material-symbols-outlined text-sm ${star <= (Math.round(prod.rating_avg) || 5) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}>star</span>
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">({prod.reviews_count || 0})</span>
                  </div>
                  <h5 className="font-bold text-sm mb-1 truncate" title={localName(prod)}>{localName(prod)}</h5>
                  <p className="text-xs text-slate-500 mb-3 truncate" title={localDesc(prod)}>{localDesc(prod)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-extrabold">${Number(prod.price).toFixed(2)}</span>
                    <AddToCartButton product={prod} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">production_quantity_limits</span>
                <p>No products available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* B2B Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-slate-900 rounded-3xl overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full w-fit mb-6">
              <span className="material-symbols-outlined text-sm">business</span>
              <span className="text-xs font-bold uppercase tracking-wider">{tHome('b2bPortal')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6" dangerouslySetInnerHTML={{ __html: b2bTitle.replace(/\n/g, '<br />') }}></h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              {b2bSubtitle}
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <span className="text-sm text-slate-300">{tHome('certifiedEquipment')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <span className="text-sm text-slate-300">{tHome('globalLogistics')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">contract</span>
                <span className="text-sm text-slate-300">{tHome('bulkDiscounts')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">support_agent</span>
                <span className="text-sm text-slate-300">{tHome('techSupport')}</span>
              </div>
            </div>
            <Link href={`/${locale}/b2b`} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-all w-fit">{tHome('joinB2B')}</Link>
          </div>
          <div className="flex-1 bg-slate-800 relative min-h-[300px]">
            <img alt="Hospital corridor" className="absolute inset-0 w-full h-full object-cover opacity-70" src={b2bImage} />
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center shadow-sm">
          <h3 className="text-2xl font-bold mb-2">{tHome('newsletter')}</h3>
          <p className="text-slate-500 mb-8">{tHome('newsletterSubtitle')}</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary" placeholder={tHome('emailPlaceholder')} type="email" />
            <button className="bg-slate-900 dark:bg-primary text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">{tHome('subscribe')}</button>
          </form>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">medical_services</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-primary">{headerTitle}</h1>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              {tFooter('description')}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">{tFooter('categoriesTitle')}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('diagnosticEquipment')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('surgicalInstruments')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('dentalCare')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('rehabilitation')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">{tFooter('companyTitle')}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link className="hover:text-primary transition-colors" href={`/${locale}/about`}>{tFooter('aboutUs')}</Link></li>
              <li><Link className="hover:text-primary transition-colors" href={`/${locale}/b2b`}>{tFooter('b2bSolutions')}</Link></li>
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('logistics')}</a></li>
              <li><Link className="hover:text-primary transition-colors" href={`/${locale}/contact`}>{tFooter('contactUs')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">{tFooter('helpCenterTitle')}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('trackOrder')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('returnsRefunds')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('certifications')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{tFooter('termsOfService')}</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 dark:border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">{tFooter('copyright')}</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-primary">social_leaderboard</span>
              <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-primary">linked_camera</span>
              <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-primary">share</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Bottom Nav Bar (Mobile) — CLIENT COMPONENT */}
      <MobileBottomBar user={user ? { id: user.id, email: user.email } : null} />
    </>
  );
}
