import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/app/[locale]/cart-components'
import { ReviewsSystem } from '@/components/reviews-system'
import { SidebarDrawer, HeaderActions, MobileBottomBar } from '@/app/[locale]/client-components'

export default async function ProductDetailPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'user'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) userRole = profile.role
  }

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name_en, name_ar)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: settingsData } = await supabase.from('site_settings').select('*')
  const settings = settingsData?.reduce((acc: Record<string, string>, curr: any) => {
    acc[curr.key] = curr.value || ''
    return acc
  }, {}) || {}
  const headerTitle = settings['header_title'] || 'MedStore'

  const isArabic = locale === 'ar'
  const localName = isArabic ? (product.name_ar || product.name_en) : product.name_en
  const localDesc = isArabic ? (product.description_ar || product.description_en) : product.description_en

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <SidebarDrawer user={user ? { id: user.id, email: user.email } : null} userRole={userRole} />
              <Link href={`/${locale}`} className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">medical_services</span>
                </div>
                <h1 className="text-lg font-bold tracking-tight text-primary">{headerTitle}</h1>
              </Link>
            </div>
            <HeaderActions user={user ? { id: user.id, email: user.email } : null} userRole={userRole} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center p-8">
              {product.image_url ? (
                <img src={product.image_url} alt={localName} className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="material-symbols-outlined text-8xl text-slate-200">image</span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Link href={`/${locale}/categories/${product.category_id}`} className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">
                {isArabic ? (product.categories?.name_ar || product.categories?.name_en) : product.categories?.name_en}
              </Link>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">{localName}</h1>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                   <span key={star} className="material-symbols-outlined text-amber-500 fill-current text-lg">star</span>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-400">5.0 (Review Section Below)</span>
            </div>

            <div className="mb-8">
              <span className="text-3xl font-extrabold text-primary">${Number(product.price).toFixed(2)}</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              {localDesc}
            </p>

            <div className="mt-auto space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
              <AddToCartButton product={product} variant="full" />
              <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-green-500">verified</span>
                  Certified Medical Grade
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-blue-500">local_shipping</span>
                  Worldwide Shipping
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="max-w-4xl border-t border-slate-100 dark:border-slate-800 mt-16 pt-16">
          <ReviewsSystem productId={product.id} userId={user?.id} />
        </div>
      </main>

      <MobileBottomBar user={user ? { id: user.id, email: user.email } : null} />
    </div>
  )
}
