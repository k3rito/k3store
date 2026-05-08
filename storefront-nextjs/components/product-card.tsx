import Link from 'next/link'
import Image from 'next/image'
import { AddToCartButton } from '@/app/[locale]/cart-components'
import { getTranslations } from 'next-intl/server'
import { Product } from '@/utils/types'

export async function ProductCard({
  product,
  locale,
  isHot = false
}: {
  product: Product,
  locale: string,
  isHot?: boolean
}) {
  const tHome = await getTranslations('Home')
  const isArabic = locale === 'ar'
  const name = isArabic ? (product.name_ar || product.name_en) : product.name_en
  const desc = isArabic ? (product.description_ar || product.description_en) : product.description_en

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:border-primary/20 flex flex-col h-full">
      <Link href={`/${locale}/products/${product.id}`} className="block relative mb-4 aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
        {isHot && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm animate-pulse">
            {tHome('hotSale')}
          </span>
        )}
        {product.image_url ? (
          <Image
            alt={name}
            src={product.image_url}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
          </div>
        )}
      </Link>

      <div className="flex items-center gap-1 mb-2">
        {[1,2,3,4,5].map((star) => (
          <span key={star} className={`material-symbols-outlined text-xs ${star <= (Math.round(product.rating_avg || 0) || 5) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}>star</span>
        ))}
        <span className="text-[10px] text-slate-400 ml-1 font-medium">({product.reviews_count || 0})</span>
      </div>

      <Link href={`/${locale}/products/${product.id}`} className="block group/title mb-1">
        <h5 className="font-bold text-sm line-clamp-1 group-hover/title:text-primary transition-colors" title={name}>{name}</h5>
      </Link>

      <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem]" title={desc}>{desc}</p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-primary font-black text-lg">${Number(product.price).toFixed(2)}</span>
        <AddToCartButton product={product} />
      </div>
    </div>
  )
}
