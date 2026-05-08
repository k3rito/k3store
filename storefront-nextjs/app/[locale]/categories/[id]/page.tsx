import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import Image from 'next/image'
import { Product, Category } from '@/utils/types'

export const revalidate = 0

export default async function CategoryProductsPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await props.params

  const { 
    getCachedCategories, 
    getCachedProducts 
  } = await import('@/utils/supabase/queries')
  
  const [allCategories, allProducts] = await Promise.all([
    getCachedCategories(),
    getCachedProducts()
  ])

  const category = (allCategories as Category[]).find((c) => c.id === id)
  if (!category) {
    notFound()
  }

  const products = (allProducts as Product[]).filter((p) => p.category_id === id)
  const localName = (item: Category) => locale === 'ar' ? (item.name_ar || item.name_en) : item.name_en

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="mb-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          {category.image_url ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-50 border-4 border-white shadow-lg mb-6 relative z-10">
               <Image src={category.image_url} alt={localName(category)} fill className="object-cover" />
            </div>
          ) : (
             <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg mb-6 relative z-10">
               <span className="material-symbols-outlined text-5xl text-primary">inventory_2</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 relative z-10">{localName(category)}</h1>
          <p className="text-slate-500 font-medium relative z-10">
            {products.length > 0
                ? `${products.length} Products found in this category`
                : 'No products found in this category'
            }
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((prod) => (
              <ProductCard key={prod.id} product={prod} locale={locale} />
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

      <Footer locale={locale} />
    </div>
  )
}
