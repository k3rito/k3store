import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/utils/types'

export function CategoryCard({
  category,
  locale
}: {
  category: Category,
  locale: string
}) {
  const isArabic = locale === 'ar'
  const name = isArabic ? (category.name_ar || category.name_en) : category.name_en

  return (
    <Link href={`/${locale}/categories/${category.id}`} className="group block h-full">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 transition-all duration-300 hover:shadow-xl hover:border-primary/20 flex flex-col items-center text-center h-full">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-4">
          {category.image_url ? (
            <Image
              alt={name}
              src={category.image_url}
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-slate-200">category</span>
            </div>
          )}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
        </div>
        <h4 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors line-clamp-1">{name}</h4>
      </div>
    </Link>
  )
}
