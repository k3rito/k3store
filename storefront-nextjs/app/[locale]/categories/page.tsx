import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CategoryCard } from '@/components/category-card'
import { GridSkeleton } from '@/components/skeletons'
import { MobileBottomBar } from '@/app/[locale]/client-components'
import { Suspense } from 'react'
import { Category } from '@/utils/types'

export const revalidate = 0

async function CategoriesList({ locale }: { locale: string }) {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').eq('status', 'active').order('display_order')

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {categories && categories.length > 0 ? (
        (categories as Category[]).map((cat) => (
          <CategoryCard key={cat.id} category={cat} locale={locale} />
        ))
      ) : (
        <div className="col-span-full text-center py-24 text-slate-500 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-5xl mb-4 block text-slate-300">category</span>
          <p className="text-lg font-medium">No categories found.</p>
        </div>
      )}
    </div>
  )
}

export default async function CategoriesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const tHome = await getTranslations('Home')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3">{tHome('shopByCategory')}</h1>
          <div className="h-2 w-20 bg-primary rounded-full"></div>
        </div>

        <Suspense fallback={<GridSkeleton count={8} type="category" />}>
          <CategoriesList locale={locale} />
        </Suspense>
      </main>

      <Footer locale={locale} />
      <MobileBottomBar user={user ? { id: user.id, email: user.email } : null} />
    </div>
  )
}
