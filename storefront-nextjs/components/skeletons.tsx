export function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 animate-pulse">
      <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4" />
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-6" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-10" />
      </div>
    </div>
  )
}

export function CategorySkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 animate-pulse">
      <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto" />
    </div>
  )
}

export function GridSkeleton({ count = 4, type = 'product' }: { count?: number, type?: 'product' | 'category' }) {
  const Skeleton = type === 'product' ? ProductSkeleton : CategorySkeleton
  return (
    <div className={`grid ${type === 'product' ? 'grid-cols-2 md:grid-cols-4 gap-8' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}
