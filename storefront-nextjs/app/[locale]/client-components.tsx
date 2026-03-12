'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'
import { CartBadge, CartDrawer } from './cart-components'
import { useCartStore } from '@/store/cartStore'

// ============= Sidebar / Drawer Component =============
export function SidebarDrawer({ user, userRole }: { user: any; userRole: string }) {
  const [open, setOpen] = useState(false)
  const { locale } = useParams<{ locale: string }>()
  const tNav = useTranslations('Navigation')
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          
          {/* Drawer Panel */}
          <aside className="absolute top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <Link href={`/${locale}`} onClick={() => setOpen(false)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <span className="material-symbols-outlined text-xl">medical_services</span>
                </div>
                <span className="font-bold text-primary">MedStore</span>
              </Link>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1">
              <Link href={`/${locale}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary bg-primary/10 font-bold text-sm">
                <span className="material-symbols-outlined">home</span>
                {tNav('home')}
              </Link>
              <Link href={`/${locale}/categories`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
                <span className="material-symbols-outlined">grid_view</span>
                {tNav('categories')}
              </Link>
              <Link href={`/${locale}/b2b`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
                <span className="material-symbols-outlined">business</span>
                {tNav('b2b')}
              </Link>
              <Link href={`/${locale}/about`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
                <span className="material-symbols-outlined">info</span>
                {tNav('about')}
              </Link>
              <Link href={`/${locale}/contact`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
                <span className="material-symbols-outlined">mail</span>
                {tNav('contact')}
              </Link>
              <Link href={`/${locale}/cart`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
                <span className="material-symbols-outlined">shopping_cart</span>
                {tNav('cart')}
              </Link>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              {user ? (
                <div className="space-y-2">
                  {['super_admin', 'supervisor', 'employee', 'editor'].includes(userRole) && (
                    <Link href={`/${locale}/admin`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      {tNav('dashboard')}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    {tNav('logout')}
                  </button>
                </div>
              ) : (
                <Link href={`/${locale}/login`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold justify-center">
                  <span className="material-symbols-outlined text-sm">login</span>
                  {tNav('login')}
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

// ============= Header Actions (Logout, Language Toggle) =============
export function HeaderActions({ user, userRole }: { user: any; userRole: string }) {
  const { locale } = useParams<{ locale: string }>()
  const tNav = useTranslations('Navigation')
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)

  // Set B2B mode based on user role (e.g. employees get wholesale pricing)
  const setB2B = useCartStore(s => s.setB2B)
  useEffect(() => {
    const b2bRoles = ['super_admin', 'supervisor', 'employee']
    setB2B(b2bRoles.includes(userRole))
  }, [userRole, setB2B])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      {/* Language Toggle */}
      <Link href={locale === 'en' ? '/ar' : '/en'} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all">
        <span className="material-symbols-outlined text-sm">language</span>
        {locale === 'en' ? 'AR' : 'EN'}
      </Link>

      {/* Cart */}
      <CartBadge onClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* User Controls */}
      {user ? (
        <div className="hidden sm:flex items-center gap-2">
          <Link href={['super_admin', 'supervisor', 'employee', 'editor'].includes(userRole) ? `/${locale}/admin` : `/${locale}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-primary flex items-center gap-1 relative group">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="text-xs font-bold hidden group-hover:block absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-1 rounded whitespace-nowrap z-50">
              {['super_admin', 'supervisor', 'employee', 'editor'].includes(userRole) ? tNav('dashboard') : tNav('home')}
            </span>
          </Link>
          <button onClick={handleLogout} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg relative group">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-xs font-bold hidden group-hover:block absolute top-10 right-0 bg-slate-900 text-white p-1 rounded z-50">{tNav('logout')}</span>
          </button>
        </div>
      ) : (
        <Link href={`/${locale}/login`} className="hidden sm:flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-sm font-bold">{tNav('login')}</span>
        </Link>
      )}
    </div>
  )
}

// ============= Mobile Bottom Bar =============
export function MobileBottomBar({ user }: { user: any }) {
  const { locale } = useParams<{ locale: string }>()
  const tNav = useTranslations('Navigation')
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex md:hidden h-16 items-center px-4 z-50">
      <Link href={`/${locale}`} className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-bold">{tNav('home')}</span>
      </Link>
      <Link href={`/${locale}/categories`} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
        <span className="material-symbols-outlined">grid_view</span>
        <span className="text-[10px] font-bold">{tNav('category')}</span>
      </Link>
      <Link href={`/${locale}/cart`} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
        <span className="material-symbols-outlined">shopping_bag</span>
        <span className="text-[10px] font-bold">{tNav('cart')}</span>
      </Link>
      
      {user ? (
        <button onClick={handleLogout} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-red-500">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[10px] font-bold">{tNav('logout')}</span>
        </button>
      ) : (
        <Link href={`/${locale}/login`} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">{tNav('login')}</span>
        </Link>
      )}
    </div>
  )
}

// ============= Task 3: Product Search Bar (products table ONLY) =============
export function ProductSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { locale } = useParams<{ locale: string }>()
  const supabase = createClient()
  const timeoutRef = useState<any>(null)
  const tNav = useTranslations('Navigation')

  const handleSearch = (q: string) => {
    setQuery(q)
    if (timeoutRef[0]) clearTimeout(timeoutRef[0])
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    const t = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('id, name_en, name_ar, price, image_url')
        .or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`)
        .eq('status', 'active')
        .limit(6)
      setResults(data || [])
      setOpen(true)
      setLoading(false)
    }, 300)
    timeoutRef[1](t)
  }

  const localName = (item: any) => locale === 'ar' ? (item.name_ar || item.name_en) : item.name_en

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary">
        <span className="material-symbols-outlined">search</span>
      </div>
      <input 
        className="block w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm" 
        placeholder={tNav('search')} 
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {/* Live Results Dropdown — products ONLY */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            {results.length} products found
          </p>
          {results.map(p => (
            <Link key={p.id} href={`/${locale}/products/${p.id}`} onClick={() => { setOpen(false); setQuery(''); }} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{localName(p)}</p>
                <p className="text-xs text-primary font-bold">${Number(p.price).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 text-center text-sm text-slate-500">
          No products found for &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}
