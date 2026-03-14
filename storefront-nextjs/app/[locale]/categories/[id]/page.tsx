import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/app/[locale]/cart-components'

export const revalidate = 0

export default async function CategoryProductsPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await props.params
  const tHome = await getTranslations('Home')
  const tNav = await getTranslations('Navigation')

  const { 
    getCachedCategories, 
    getCachedProducts 
  } = await import('@/utils/supabase/queries')
  
  const [allCategories, allProducts] = await Promise.all([
    getCachedCategories(),
    getCachedProducts()
  ])

  const category = allCategories.find((c: any) => c.id === id)
  if (!category) {
    notFound()
  }

  const products = allProducts.filter((p: any) => p.category_id === id)

  const localName = (item: any) => locale === 'ar' ? (item.name_ar || item.name_en) : item.name_en
  const localDesc = (item: any) => locale === 'ar' ? (item.description_ar || item.description_en) : item.description_en

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
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/categories`} className="text-sm text-slate-500 font-bold hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm flex-shrink-0">category</span>
              Categories
            </Link>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <Link href={`/${locale}`} className="text-sm text-slate-500 font-bold hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm flex-shrink-0">arrow_back</span>
              {tNav('home')}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Hero */}
        <div className="mb-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          {category.image_url ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-50 border-4 border-white shadow-lg mb-6 relative z-10">
               <img src={category.image_url} alt={localName(category)} className="w-full h-full object-cover" />
            </div>
          ) : (
             <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg mb-6 relative z-10">
               <span className="material-symbols-outlined text-5xl text-primary">inventory_2</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 relative z-10">{localName(category)}</h1>
          <p className="text-slate-500 font-medium relative z-10">{products?.length || 0} Products found in this category</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products && products.length > 0 ? (
            products.map((prod: any, i: number) => (
              <div key={prod.id || i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <Link href={`/${locale}/products/${prod.id}`} className="group/img block relative mb-4">
                  {prod.image_url ? (
                    <img alt={localName(prod)} className="w-full h-48 object-contain relative z-0 group-hover/img:scale-105 transition-transform" src={prod.image_url} />
                  ) : (
                    <div className="w-full h-48 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-lg">
                      <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                    </div>
                  )}
                </Link>
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className={`material-symbols-outlined text-sm ${star <= (Math.round(prod.rating_avg) || 5) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}>star</span>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">({prod.reviews_count || 0})</span>
                </div>
                <Link href={`/${locale}/products/${prod.id}`} className="block group/title">
                  <h5 className="font-bold text-sm mb-1 truncate group-hover/title:text-primary transition-colors" title={localName(prod)}>{localName(prod)}</h5>
                </Link>
                <p className="text-xs text-slate-500 mb-3 truncate" title={localDesc(prod)}>{localDesc(prod)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-extrabold">${Number(prod.price).toFixed(2)}</span>
                  <AddToCartButton product={prod} />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl border-dashed">
              <span className="material-symbols-outlined text-6xl mb-4 text-slate-300 block">production_quantity_limits</span>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Products Yet</h3>
              <p className="max-w-md mx-auto">There are currently no active products available in this category. Please check back later.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
