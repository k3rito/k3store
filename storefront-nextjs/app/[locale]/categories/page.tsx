import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const revalidate = 0

export default async function CategoriesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const tHome = await getTranslations('Home')
  const tNav = await getTranslations('Navigation')

  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').eq('status', 'active').order('display_order')

  const localName = (item: any) => locale === 'ar' ? (item.name_ar || item.name_en) : item.name_en

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

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold">{tHome('shopByCategory')}</h1>
          <div className="h-1 w-12 bg-primary mt-2"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((cat: any) => (
              <Link href={`/${locale}/categories/${cat.id}`} key={cat.id} className="group cursor-pointer block">
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
            <div className="col-span-full text-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">category</span>
              No categories found.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
