import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/app/[locale]/cart-components'
import { ReviewsSystem } from '@/components/reviews-system'
import { MobileBottomBar } from '@/app/[locale]/client-components'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { Product } from '@/utils/types'
import { Metadata } from 'next'
import { getCachedSettings } from '@/utils/supabase/queries'

export async function generateMetadata(props: { params: Promise<{ locale: string, id: string }> }): Promise<Metadata> {
  const { id, locale } = await props.params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('name_en, name_ar, description_en, description_ar, image_url').eq('id', id).single()

  if (!product) return {}

  const settings = await getCachedSettings()
  const headerTitle = settings['header_title'] || 'MedStore'
  const name = locale === 'ar' ? (product.name_ar || product.name_en) : product.name_en
  const desc = locale === 'ar' ? (product.description_ar || product.description_en) : product.description_en

  return {
    title: `${name} | ${headerTitle}`,
    description: desc?.slice(0, 160),
    openGraph: {
        images: product.image_url ? [product.image_url] : []
    }
  }
}

export default async function ProductDetailPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name_en, name_ar)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const typedProduct = product as Product
  const isArabic = locale === 'ar'
  const localName = isArabic ? (typedProduct.name_ar || typedProduct.name_en) : typedProduct.name_en
  const localDesc = isArabic ? (typedProduct.description_ar || typedProduct.description_en) : typedProduct.description_en

  const rating = typedProduct.rating_avg ? Math.round(typedProduct.rating_avg) : 0
  const count = typedProduct.reviews_count || 0

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      <Header locale={locale} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Images */}
          <div className="relative aspect-square rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center p-12 group">
            {typedProduct.image_url ? (
              <Image
                src={typedProduct.image_url}
                alt={localName}
                fill
                priority
                className="object-contain p-12 group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <span className="material-symbols-outlined text-9xl text-slate-200">image</span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <Link href={`/${locale}/categories/${typedProduct.category_id}`} className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] hover:opacity-80 mb-4 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                <span className="material-symbols-outlined text-sm">category</span>
                {isArabic ? (typedProduct.categories?.name_ar || typedProduct.categories?.name_en) : typedProduct.categories?.name_en}
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.2]">{localName}</h1>
            </div>

            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
              {count > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                       <span key={star} className={`material-symbols-outlined text-amber-500 text-xl ${star <= rating ? 'fill-current' : ''}`}>star</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-400">
                    {typedProduct.rating_avg?.toFixed(1)} Based on {count} Verified Reviews
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-400 italic">No reviews yet for this product</span>
              )}
            </div>

            <div className="mb-10">
              <div className="text-primary font-black text-4xl mb-2">${Number(typedProduct.price).toFixed(2)}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Excluding VAT & Shipping</div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-[1.8] text-lg mb-12">
              {localDesc}
            </p>

            <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
              <AddToCartButton product={typedProduct} variant="full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="material-symbols-outlined text-green-500">verified</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Certified Medical Grade</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="material-symbols-outlined text-blue-500">local_shipping</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Worldwide Logistics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32 pt-20 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h3 className="text-3xl font-black mb-2">Customer Feedback</h3>
              <div className="h-1.5 w-16 bg-primary rounded-full"></div>
            </div>
            <ReviewsSystem productId={typedProduct.id} userId={user?.id} />
          </div>
        </div>
      </main>

      <Footer locale={locale} />
      <MobileBottomBar user={user ? { id: user.id, email: user.email } : null} />
    </div>
  )
}
