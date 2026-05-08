'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import {
  updateSetting,
  deleteProduct,
} from './actions'
import CMSBuilder from './site-settings-tab'
import { Category, Product, Profile, Order } from '@/utils/types'

// ── Types ──
type Tab = 'overview' | 'products' | 'categories' | 'settings' | 'users' | 'orders' | 'reviews' | 'cms'

interface AdminLayoutProps {
  defaultTab: Tab
  locale: string
  profile: Profile | null
  email: string
  categories: Category[]
  products: Product[]
  profiles: Profile[]
  settings: Record<string, string>
  dynamicPages: any[]
  orders: Order[]
  reviews: any[]
  metrics: {
      totalProducts: number
      totalOrders: number
      totalRevenue: number
      activeStaff: number
  }
}

// ── Helper: Site Settings Tab ──
function SettingsTab({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      for (const [key, value] of Object.entries(settings)) {
        if (value !== initialSettings[key]) {
          await updateSetting(key, value)
        }
      }
      setMessage('Settings updated successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h2 className="text-2xl font-bold font-[Manrope]">Site Configuration</h2>
        <p className="text-slate-500 text-sm">Global branding and marketing settings.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Header Title</label>
            <input value={settings['header_title'] || ''} onChange={e => setSettings({...settings, header_title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Image URL</label>
            <input value={settings['hero_image'] || ''} onChange={e => setSettings({...settings, hero_image: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
            {settings['hero_image'] && (
                <div className="mt-2 relative h-20 w-40 rounded-xl overflow-hidden border">
                    <Image src={settings['hero_image']} fill className="object-cover" alt="Hero Preview" />
                </div>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Title</label>
            <textarea value={settings['hero_title'] || ''} onChange={e => setSettings({...settings, hero_title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 min-h-[100px]" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Facebook URL</label>
             <input value={settings['social_facebook'] || ''} onChange={e => setSettings({...settings, social_facebook: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instagram URL</label>
             <input value={settings['social_instagram'] || ''} onChange={e => setSettings({...settings, social_instagram: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
           {message && <span className="text-emerald-500 text-xs font-bold">{message}</span>}
           <button disabled={loading} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
             {loading ? 'Saving...' : 'Save Settings'}
           </button>
        </div>
      </form>
    </div>
  )
}

// ── Main Admin Layout ──
export function AdminLayout({
  defaultTab,
  locale,
  profile,
  categories,
  products,
  profiles,
  settings,
  dynamicPages,
  orders,
  metrics
}: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const [isActionPending, setIsActionPending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  const handleDeleteProduct = async (id: string) => {
      if (!confirm('Are you sure you want to delete this medical product?')) return
      setIsActionPending(true)
      try {
          const res = await deleteProduct(id)
          if (!res.success) alert(res.error)
          else router.refresh()
      } catch (err: any) {
          alert(err.message)
      } finally {
          setIsActionPending(false)
      }
  }

  const menuItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'products', label: 'Products', icon: 'inventory_2' },
    { id: 'categories', label: 'Categories', icon: 'category' },
    { id: 'cms', label: 'CMS Pages', icon: 'web_stories' },
    { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
    { id: 'users', label: 'Staff', icon: 'badge' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'supervisor'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex font-display antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
             <span className="material-symbols-outlined text-white block">admin_panel_settings</span>
          </div>
          <span className="text-lg font-black tracking-tight uppercase">MedAdmin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-4">
           <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                 {profile?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-black truncate">{profile?.full_name || 'Admin'}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{profile?.role}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm">
             <span className="material-symbols-outlined text-[20px]">logout</span>
             Sign Out
           </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 overflow-y-auto">
         {activeTab === 'overview' && (
             <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back, {profile?.full_name?.split(' ')[0]}</h1>
                    <p className="text-slate-500 font-medium mt-1">Here is what is happening with your medical storefront today.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Revenue', val: `$${metrics.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'text-emerald-500' },
                        { label: 'Total Orders', val: metrics.totalOrders.toLocaleString(), icon: 'shopping_bag', color: 'text-blue-500' },
                        { label: 'Total Products', val: metrics.totalProducts.toLocaleString(), icon: 'inventory_2', color: 'text-purple-500' },
                        { label: 'Active Staff', val: metrics.activeStaff.toLocaleString(), icon: 'verified_user', color: 'text-amber-500' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                                <span className="text-2xl font-black">{stat.val}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
             </div>
         )}

         {activeTab === 'settings' && <SettingsTab initialSettings={settings} />}

         {activeTab === 'products' && (
             <div className="space-y-6">
                <header className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-[Manrope]">Products Management</h2>
                    <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">Add Product</button>
                </header>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex-shrink-0">
                                            {p.image_url && <Image src={p.image_url} fill className="object-cover" alt="" />}
                                        </div>
                                        <span className="font-bold text-sm truncate max-w-[200px]">{p.name_en}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{p.stock || 0} Units</td>
                                <td className="px-6 py-4 text-sm font-bold text-primary">${Number(p.price).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button
                                            disabled={isActionPending}
                                            onClick={() => handleDeleteProduct(p.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
         )}

         {activeTab === 'orders' && (
             <div className="space-y-6">
                <header>
                    <h2 className="text-2xl font-bold font-[Manrope]">Orders Overview</h2>
                    <p className="text-slate-500 text-sm">Recent clinical supply orders.</p>
                </header>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID / Customer</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm truncate uppercase tracking-tighter">ID: {o.id.split('-')[0]}</p>
                                    <p className="text-xs text-slate-500">{o.customer_name || o.profiles?.full_name || 'Guest'}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">${o.total_amount?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-xs text-slate-500 font-medium">{new Date(o.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${o.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {o.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
         )}

         {activeTab === 'cms' && (
             <div className="h-full">
                 <CMSBuilder pages={dynamicPages} isAdmin={isAdmin} locale={locale} />
             </div>
         )}

         {!['overview', 'settings', 'products', 'cms', 'orders'].includes(activeTab) && ( activeTab === 'users' ? (
             <div className="p-20 text-center">
                 <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">badge</span>
                 <h2 className="text-xl font-bold text-slate-500">Managing STAFF PERSONNEL</h2>
                 <p className="text-slate-400 text-sm mt-1">This module is part of the standard management suite.</p>
                 <Link href={`/${locale}/admin/staff`} className="mt-6 inline-block text-primary font-bold hover:underline">Go to Staff Management Page &rarr;</Link>
             </div>
         ) : (
            <div className="p-20 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">construction</span>
                <h2 className="text-xl font-bold text-slate-500">Managing {activeTab.toUpperCase()}</h2>
                <p className="text-slate-400 text-sm mt-1">This module is being finalized for production.</p>
            </div>
         ))}
      </main>
    </div>
  )
}
