'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateSetting, updateCategoryOrder, deleteProduct, createCategory, updateCategory, createProduct, updateProduct, deleteCategory, updateUserRole, addStaffMember, revokeAccess } from './actions'
import { useTranslations } from 'next-intl'
import SiteSettingsTab from './site-settings-tab'

// Standalone Delete Button Component
function DeleteProductButton({ productId, imageUrl }: { productId: string; imageUrl?: string }) {
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleClick = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    setDeleting(true)
    setToast(null)
    try {
      if (imageUrl && imageUrl.includes('public_assets')) {
        const path = imageUrl.split('/public_assets/').pop()
        if (path) {
          await supabase.storage.from('public_assets').remove([path])
        }
      }
      const result = await deleteProduct(productId)
      if (result && !result.success) {
        setToast({ message: result.error || 'Failed to delete product', type: 'error' })
        setDeleting(false)
        setTimeout(() => setToast(null), 3000)
        return
      }
      setToast({ message: 'Product deleted successfully!', type: 'success' })
      router.refresh()
      setTimeout(() => setToast(null), 3000)
    } catch (err: any) {
      console.error('Delete failed:', err)
      setToast({ message: 'Failed to delete product: ' + (err?.message || 'Unknown error'), type: 'error' })
      setDeleting(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={deleting}
        onClick={handleClick}
        className={`p-1.5 transition-colors ${deleting ? 'text-slate-300 cursor-wait' : 'text-slate-400 hover:text-red-500'}`}
      >
        <span className="material-symbols-outlined text-lg">{deleting ? 'hourglass_top' : 'delete'}</span>
      </button>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] animate-toast-in flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}
    </>
  )
}

type Tab = 'overview' | 'products' | 'categories' | 'settings' | 'users' | 'orders' | 'reviews' | 'site-settings'
type AppRole = 'super_admin' | 'supervisor' | 'employee' | 'editor' | 'user'

export function AdminLayout({ defaultTab, locale, profile, email, categories, products, profiles, settings, dynamicPages, orders, reviews }: {
  defaultTab: Tab,
  locale: string,
  profile: any,
  email: string,
  categories: any[],
  products: any[],
  profiles: any[],
  settings: Record<string, string>,
  dynamicPages: any[],
  orders: any[],
  reviews: any[]
}) {
  const t = useTranslations('Admin')
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const router = useRouter()
  const supabase = createClient()

  // === Task 3: Product Search State ===
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const searchTimeout = useRef<any>(null)

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (q.trim().length < 2) { setSearchResults([]); setSearchOpen(false); return }
    searchTimeout.current = setTimeout(async () => {
      const { data } = await supabase.from('products').select('id, name_en, name_ar, price, image_url').or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`).limit(8)
      setSearchResults(data || [])
      setSearchOpen(true)
    }, 300)
  }

  // === Task 7: Notifications State ===
  const [notifOpen, setNotifOpen] = useState(false)
  const notifications = [
    { id: 1, icon: 'shopping_cart', text: 'New order #1042 received', time: '2 min ago', read: false },
    { id: 2, icon: 'warning', text: 'Low stock: Pulse Oximeter (3 left)', time: '1 hour ago', read: false },
    { id: 3, icon: 'person_add', text: 'New user registered', time: '3 hours ago', read: true },
    { id: 4, icon: 'star', text: 'New 5-star review on Blood Pressure Monitor', time: '5 hours ago', read: true },
  ]

  // === Task 8: Mobile sidebar toggle ===
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // === RBAC: Role-based sidebar navigation filtering ===
  const userRole: AppRole = (profile?.role as AppRole) || 'user'

  const allTabs: { id: string; icon: string; label: string; badge?: string; roles: AppRole[] }[] = [
    { id: 'overview', icon: 'dashboard', label: t('overview'), roles: ['super_admin', 'supervisor'] },
    { id: 'products', icon: 'inventory_2', label: t('products'), roles: ['super_admin', 'supervisor', 'employee'] },
    { id: 'categories', icon: 'account_tree', label: t('categories'), roles: ['super_admin', 'supervisor', 'employee'] },
    { id: 'orders', icon: 'shopping_cart', label: 'Orders', badge: '12', roles: ['super_admin', 'supervisor', 'employee'] },
    { id: 'reviews', icon: 'reviews', label: 'Reviews', roles: ['super_admin', 'supervisor', 'employee'] },
    { id: 'site-settings', icon: 'web', label: 'CMS Builder', roles: ['super_admin', 'supervisor', 'editor'] },
    { id: 'settings', icon: 'settings', label: t('settings'), roles: ['super_admin', 'supervisor'] },
    { id: 'users', icon: 'manage_accounts', label: 'Staff', roles: ['super_admin', 'supervisor'] },
  ]

  const visibleTabs = allTabs.filter(tab => tab.roles.includes(userRole))

  const roleLabelMap: Record<string, string> = {
    super_admin: 'Super Admin',
    supervisor: 'Supervisor',
    employee: 'Employee',
    editor: 'Editor',
    user: 'User',
  }
  const roleColorMap: Record<string, string> = {
    super_admin: 'bg-primary/20 text-primary',
    supervisor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    editor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    user: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <button onClick={() => setSidebarOpen(true)} className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-slate-900 shadow-md p-2 rounded-lg border border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — Task 2: responsive, Task 6: clickable logo, Task 8: orders/reviews */}
      <aside className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          {/* Task 6: Clickable Logo */}
          <a href={`/${locale}`} className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-3xl">medical_services</span>
            <span>MedAdmin</span>
          </a>
        </div>

        {/* Navigation — RBAC-filtered */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as Tab); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-left ${activeTab === tab.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </div>
              {tab.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Footer inside Sidebar */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider font-bold">Staff Access</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{profile?.full_name || email}</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColorMap[userRole] || 'bg-slate-100 text-slate-600'}`}>{roleLabelMap[userRole] || userRole}</span>
              </div>
            </div>
            <button onClick={async () => {
              const localSupabase = createClient()
              await localSupabase.auth.signOut()
              window.location.href = `/${locale}/login`
            }} type="button" className="w-full mt-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content — Task 2: responsive margins */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Top Header — Task 3: search, Task 4: back button, Task 7: notifications */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-12 lg:mt-0">
          {/* Task 4: Go Back Button */}
          <button onClick={() => router.back()} type="button" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Go Back
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Task 3: Product Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm w-full sm:w-64"
                placeholder="Search products..."
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              />
              {/* Search Results Dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                  <p className="px-4 py-2 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800">Products Found ({searchResults.length})</p>
                  {searchResults.map(p => (
                    <button key={p.id} type="button" onClick={() => { setActiveTab('products'); setSearchOpen(false); setSearchQuery(''); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{p.name_en}</p>
                        <p className="text-xs text-slate-500">${Number(p.price).toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 p-4 text-center text-sm text-slate-500">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Task 7: Notifications Bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} type="button" className="relative p-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{notifications.filter(n => !n.read).length} new</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex items-start gap-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
                        <div className={`p-1.5 rounded-lg ${!n.read ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{n.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{n.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" className="text-xs text-primary font-bold hover:underline w-full text-center">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'overview' && <OverviewTab orders={orders} profiles={profiles} reviews={reviews} />}
        {activeTab === 'products' && <ProductsTab initialProducts={products} categories={categories} />}
        {activeTab === 'categories' && <CategoriesTab initialCategories={categories} />}
        {activeTab === 'settings' && <SettingsTab initialSettings={settings} />}
        {activeTab === 'users' && <UsersTab fallbackEmail={email} initialProfiles={profiles} currentUserId={profile.id} currentUserRole={userRole} />}
        {activeTab === 'orders' && <OrdersTab initialOrders={orders} />}
        {activeTab === 'reviews' && <ReviewsTab initialReviews={reviews} />}
        {activeTab === 'site-settings' && <SiteSettingsTab initialPages={dynamicPages} userRole={userRole} />}
      </main>
    </div>
  )
}

function UsersTab({ fallbackEmail, initialProfiles, currentUserId, currentUserRole }: { fallbackEmail: string, initialProfiles: any[], currentUserId: string, currentUserRole: AppRole }) {
  const router = useRouter()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [loading, setLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<any>(null)

  const roleLabelMap: Record<string, string> = {
    super_admin: 'Super Admin', supervisor: 'Supervisor', employee: 'Employee', editor: 'Editor', user: 'User',
  }
  const roleColorMap: Record<string, string> = {
    super_admin: 'bg-primary/20 text-primary dark:bg-primary/30',
    supervisor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    editor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    user: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }

  const handleRoleChange = async (userId: string, targetRole: string) => {
    // super_admin CAN modify self; others cannot
    if (userId === currentUserId && currentUserRole !== 'super_admin') {
      alert('You cannot change your own role.'); return
    }
    if (currentUserRole === 'supervisor' && profiles.find(p => p.id === userId)?.role === 'super_admin') {
      alert('Supervisors cannot modify Super Admin accounts.'); return
    }
    if (currentUserRole === 'supervisor' && targetRole === 'super_admin') {
      alert('Supervisors cannot promote users to Super Admin.'); return
    }
    setLoading(userId)
    try {
      await updateUserRole(userId, targetRole as any)
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: targetRole, role_updated_at: new Date().toISOString() } : p))
    } catch (e: any) { alert(e?.message || 'Error updating role') } finally { setLoading(null) }
  }

  const canModify = (p: any) => {
    if (p.id === currentUserId && currentUserRole === 'super_admin') return true
    if (p.id === currentUserId) return false
    if (currentUserRole === 'supervisor' && p.role === 'super_admin') return false
    return true
  }

  const availableRoles = currentUserRole === 'super_admin'
    ? ['super_admin', 'supervisor', 'employee', 'editor', 'user']
    : ['supervisor', 'employee', 'editor', 'user']

  const handleAddStaff = async () => {
    if (!addEmail.trim() || !addRole) return
    setAddLoading(true)
    try {
      await addStaffMember(addEmail.trim(), addRole as any)
      setShowAddModal(false); setAddEmail(''); setAddRole('')
      router.refresh()
    } catch (e: any) { alert(e?.message || 'Error adding staff') } finally { setAddLoading(false) }
  }

  const handleRevoke = async (userId: string) => {
    if (!confirm('Revoke this user\'s admin access? They will be demoted to User role.')) return
    setLoading(userId)
    try {
      await revokeAccess(userId)
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: 'user', role_updated_at: new Date().toISOString() } : p))
      setSelectedProfile(null)
    } catch (e: any) { alert(e?.message || 'Error revoking access') } finally { setLoading(null) }
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Staff Members</h2>
          <p className="text-slate-500 text-sm">Manage medical personnel and administrative access</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">person_add</span> Add New Staff
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name / Profile</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Access Level</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {profiles.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${p.id === currentUserId ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                        {(p.full_name || p.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{p.full_name || 'No Name'}</span>
                        {p.id === currentUserId && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">YOU</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 italic text-sm">{p.email || fallbackEmail}</td>
                  <td className="px-6 py-4">
                    {canModify(p) ? (
                      <select disabled={loading === p.id} value={p.role} onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:border-slate-700 disabled:opacity-50">
                        {availableRoles.map(role => <option key={role} value={role}>{roleLabelMap[role]}</option>)}
                      </select>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColorMap[p.role] || roleColorMap.user}`}>{roleLabelMap[p.role] || p.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedProfile(p)} className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Employee Details Drawer ═══ */}
      {selectedProfile && (
        <div className="fixed inset-0 z-40" onClick={() => setSelectedProfile(null)}>
          <div className="absolute inset-y-0 right-0 w-96 max-w-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Employee Details</h3>
              <button onClick={() => setSelectedProfile(null)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="size-24 rounded-full border-4 border-primary/10 p-1 mb-4 shadow-lg flex items-center justify-center bg-primary/20 text-primary">
                  <span className="text-3xl font-bold">{(selectedProfile.full_name || selectedProfile.email || '?')[0].toUpperCase()}</span>
                </div>
                <h4 className="text-xl font-bold">{selectedProfile.full_name || 'No Name'}</h4>
                <p className="text-primary font-medium">{roleLabelMap[selectedProfile.role] || selectedProfile.role}</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contact Email</label>
                  <p className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                    {selectedProfile.email || fallbackEmail}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Site Access Role</label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">admin_panel_settings</span>
                    <span className={`px-2 py-0.5 rounded text-sm font-semibold ${roleColorMap[selectedProfile.role] || ''}`}>{roleLabelMap[selectedProfile.role] || selectedProfile.role}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Joined Site Date</label>
                    <p className="text-sm font-semibold mt-1">{selectedProfile.created_at ? new Date(selectedProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : '—'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Role Assigned Date</label>
                    <p className="text-sm font-semibold mt-1">{selectedProfile.role_updated_at ? new Date(selectedProfile.role_updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : '—'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => setSelectedProfile(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">Close</button>
              {selectedProfile.id !== currentUserId && (
                <button onClick={() => handleRevoke(selectedProfile.id)} className="flex-1 py-2.5 rounded-lg border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">Revoke Access</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Add Staff Modal ═══ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-primary/5">
              <div>
                <h3 className="text-lg font-bold">Add New Staff Member</h3>
                <p className="text-xs text-slate-500">Grant administrative access to an existing user</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setAddEmail(''); setAddRole('') }} className="size-8 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Staff Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">alternate_email</span>
                  <input value={addEmail} onChange={e => setAddEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm" placeholder="e.g. doctor.name@clinic.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Initial Role</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">manage_accounts</span>
                  <select value={addRole} onChange={e => setAddRole(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary appearance-none text-sm">
                    <option disabled value="">Select a role...</option>
                    {availableRoles.filter(r => r !== 'user').map(role => <option key={role} value={role}>{roleLabelMap[role]}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">info</span>
                <p className="text-xs text-primary leading-relaxed">The user must already have an account. This will upgrade their role from &quot;User&quot; to the selected admin role.</p>
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => { setShowAddModal(false); setAddEmail(''); setAddRole('') }} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">Cancel</button>
                <button disabled={addLoading || !addEmail.trim() || !addRole} onClick={handleAddStaff} className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50">{addLoading ? 'Adding...' : 'Add Staff'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function OverviewTab({ orders, profiles, reviews }: { orders: any[], profiles: any[], reviews: any[] }) {
  const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + Number(o.total), 0)
  const newUsers = profiles.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">Key metrics for your store.</p>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-bold text-green-500">Live</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Sales</p>
          <p className="text-2xl font-bold mt-1">${totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-xs font-bold text-green-500">Live</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Users</p>
          <p className="text-2xl font-bold mt-1">{newUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="text-xs font-bold text-slate-400">Live</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Pending Orders</p>
          <p className="text-2xl font-bold mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <span className="material-symbols-outlined">star</span>
            </div>
            <span className="text-xs font-bold text-green-500">Live</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Average Rating</p>
          <p className="text-2xl font-bold mt-1">{avgRating}</p>
        </div>
      </div>
    </>
  )
}

function SettingsTab({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const supabase = createClient()

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg('')

    try {
      const formData = new FormData(e.currentTarget)
      const updates = []

      for (const [key, val] of formData.entries()) {
        if (typeof val === 'string' && val.trim() !== '') {
          // It's a text setting
          updates.push(updateSetting(key, val))
        } else if (val instanceof File && val.size > 0) {
          // File upload
          const ext = val.name.split('.').pop()
          const fileName = `${key}-${Date.now()}.${ext}`
          const { data, error } = await supabase.storage.from('public_assets').upload(fileName, val)
          if (!error && data) {
            const { data: publicUrlData } = supabase.storage.from('public_assets').getPublicUrl(data.path)
            if (publicUrlData) {
              updates.push(updateSetting(key, publicUrlData.publicUrl))
            }
          }
        }
      }

      await Promise.all(updates)
      setSuccessMsg('Settings saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error(err)
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Content Management</h1>
          <p className="text-slate-500 text-sm">Update site texts and images directly.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">

        <h3 className="font-bold border-b border-slate-100 pb-2">Header Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Header Title</label>
            <input name="header_title" defaultValue={initialSettings['header_title']} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="MedStore" />
          </div>
        </div>

        <h3 className="font-bold border-b border-slate-100 pb-2 mt-8">Hero Section</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Title</label>
            <textarea name="hero_title" rows={2} defaultValue={initialSettings['hero_title']} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Professional Medical Solutions..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Subtitle</label>
            <textarea name="hero_subtitle" rows={2} defaultValue={initialSettings['hero_subtitle']} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Equip your healthcare facility..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Background Image</label>
            <input type="file" name="hero_image" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            {initialSettings['hero_image'] && <img src={initialSettings['hero_image']} className="mt-2 h-20 rounded border object-cover" alt="Hero Current" />}
          </div>
        </div>

        <h3 className="font-bold border-b border-slate-100 pb-2 mt-8">B2B Section</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">B2B Title</label>
            <textarea name="b2b_title" rows={2} defaultValue={initialSettings['b2b_title']} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Equip Your Entire Medical Facility" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">B2B Subtitle</label>
            <textarea name="b2b_subtitle" rows={2} defaultValue={initialSettings['b2b_subtitle']} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Get wholesale pricing..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">B2B Image</label>
            <input type="file" name="b2b_image" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            {initialSettings['b2b_image'] && <img src={initialSettings['b2b_image']} className="mt-2 h-20 rounded border object-cover" alt="B2B Current" />}
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-all shadow disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          {successMsg && <span className="text-green-600 font-bold text-sm">{successMsg}</span>}
        </div>
      </form>
    </>
  )
}

function CategoriesTab({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const handleSort = async () => {
    let _cats = [...categories]
    const draggedItemContent = _cats.splice(dragItem.current!, 1)[0]
    _cats.splice(dragOverItem.current!, 0, draggedItemContent)
    dragItem.current = null
    dragOverItem.current = null

    // update order numbers internally
    _cats = _cats.map((c, i) => ({ ...c, display_order: i }))
    setCategories(_cats)

    // Save to DB
    await updateCategoryOrder(_cats.map(c => ({ id: c.id, display_order: c.display_order })))
  }

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Management</h1>
          <p className="text-slate-500 text-sm">Organize how customers see your medical supplies.</p>
        </div>
        <button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-lg">add</span>
          New Category
        </button>
      </header>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">drag_indicator</span>
            Category Reordering
          </h2>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Drag cards to reorder appearance</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <div
              key={cat.id || index}
              draggable
              onDragStart={(e) => dragItem.current = index}
              onDragEnter={(e) => dragOverItem.current = index}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="group relative bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 cursor-move transition-all"
            >
              <div className="flex items-start justify-between pointer-events-none">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {cat.image_url ? (
                      <img src={cat.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-3xl">image</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{cat.name_en}</h3>
                    <div className="mt-2 flex gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Visibility: {cat.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors pointer-events-auto cursor-grab active:cursor-grabbing">drag_handle</span>
                  <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="text-slate-400 hover:text-primary transition-colors pointer-events-auto">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={async () => {
                    if (confirm('Delete this category?')) {
                      await deleteCategory(cat.id);
                      setCategories(categories.filter(c => c.id !== cat.id));
                    }
                  }} className="text-slate-400 hover:text-red-500 transition-colors pointer-events-auto">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-lg">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button disabled={loading} onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form action={async (formData) => {
              setLoading(true)
              try {
                let imageUrl = editingCategory?.image_url;
                const file = formData.get('image') as File;
                if (file && file.size > 0) {
                  const ext = file.name.split('.').pop();
                  const fileName = `cat_${Date.now()}.${ext}`;
                  const { data, error } = await supabase.storage.from('public_assets').upload(fileName, file);
                  if (!error && data) {
                    const { data: publicUrlData } = supabase.storage.from('public_assets').getPublicUrl(data.path);
                    imageUrl = publicUrlData.publicUrl;
                  }
                }

                if (editingCategory) {
                  await updateCategory(editingCategory.id, formData.get('name_en') as string, formData.get('name_ar') as string, imageUrl);
                  setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name_en: formData.get('name_en'), name_ar: formData.get('name_ar'), image_url: imageUrl } : c));
                } else {
                  await createCategory(formData.get('name_en') as string, formData.get('name_ar') as string, imageUrl);
                  // Quick reload for simplicity to reflect new ID from DB
                  window.location.reload();
                }
                setIsModalOpen(false);
              } catch (err) {
                console.error(err);
                alert('Error submitting form');
              } finally {
                setLoading(false)
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name (English) *</label>
                <input required name="name_en" defaultValue={editingCategory?.name_en} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name (Arabic) *</label>
                <input required name="name_ar" defaultValue={editingCategory?.name_ar} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category Image</label>
                <input type="file" name="image" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                {editingCategory?.image_url && <img src={editingCategory.image_url} className="mt-2 h-16 rounded border object-cover" alt="Current" />}
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow">
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function ProductsTab({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Management</h1>
          <p className="text-slate-500 text-sm">Manage your inventory and stock.</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-lg">add</span>
          New Product
        </button>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">Recent Products</h2>
          <button className="text-xs font-bold text-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {products.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                        {prod.image_url && <img src={prod.image_url} className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-bold truncate max-w-xs">{prod.name_en}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${(prod.stock || 0) > 20
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                      {prod.stock || 0} Units
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">${Number(prod.price).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 ${prod.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {prod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingProduct(prod); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <DeleteProductButton productId={prod.id} imageUrl={prod.image_url} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-8 text-center text-slate-500">No products found.</div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <h2 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button disabled={loading} onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form action={async (formData) => {
                setLoading(true)
                try {
                  let imageUrl = editingProduct?.image_url;
                  const file = formData.get('image') as File;
                  if (file && file.size > 0) {
                    const ext = file.name.split('.').pop();
                    const fileName = `prod_${Date.now()}.${ext}`;
                    const { data, error } = await supabase.storage.from('public_assets').upload(fileName, file);
                    if (!error && data) {
                      const { data: publicUrlData } = supabase.storage.from('public_assets').getPublicUrl(data.path);
                      imageUrl = publicUrlData.publicUrl;
                    }
                  }

                  const productData = {
                    name_en: formData.get('name_en') as string,
                    name_ar: formData.get('name_ar') as string,
                    description_en: formData.get('description_en') as string,
                    description_ar: formData.get('description_ar') as string,
                    price: Number(formData.get('price')),
                    stock_quantity: Number(formData.get('stock_quantity')),
                    category_id: formData.get('category_id') as string,
                    status: formData.get('status') as string,
                    image_url: imageUrl
                  };

                  if (editingProduct) {
                    await updateProduct(editingProduct.id, productData);
                  } else {
                    await createProduct(productData);
                  }
                  window.location.reload();
                } catch (err) {
                  console.error(err);
                  alert('Error saving product');
                  setLoading(false);
                }
              }} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name (English) *</label>
                    <input required name="name_en" defaultValue={editingProduct?.name_en} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name (Arabic) *</label>
                    <input required name="name_ar" defaultValue={editingProduct?.name_ar} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-right" dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description (English)</label>
                    <textarea name="description_en" rows={3} defaultValue={editingProduct?.description_en} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description (Arabic)</label>
                    <textarea name="description_ar" rows={3} defaultValue={editingProduct?.description_ar} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-right" dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Price ($) *</label>
                    <input required type="number" step="0.01" name="price" defaultValue={editingProduct?.price} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Stock *</label>
                    <input required type="number" name="stock_quantity" defaultValue={editingProduct?.stock ?? 0} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select name="category_id" defaultValue={editingProduct?.category_id || ''} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm">
                      <option value="">-- No Category --</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name_en}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select name="status" defaultValue={editingProduct?.status || 'active'} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Product Image</label>
                    <input type="file" name="image" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    {editingProduct?.image_url && <img src={editingProduct.image_url} className="mt-2 h-16 rounded border object-cover" alt="Current" />}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 mt-6 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow">
                    {loading ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============= Task 8: Orders Tab =============
function OrdersTab({ initialOrders }: { initialOrders: any[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const orders = initialOrders.map(o => ({
    id: `#ORD-${o.id.slice(0, 4).toUpperCase()}`,
    customer: o.profiles?.full_name || 'Anonymous',
    email: o.profiles?.email || 'No Email',
    total: Number(o.total),
    status: o.status,
    date: new Date(o.created_at).toLocaleDateString(),
    items: 0
  }))

  const totalPages = Math.ceil(orders.length / pageSize)
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-slate-500 text-sm">Track and manage customer orders.</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'processing', 'completed'].map(f => (
            <button key={f} type="button" className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 capitalize hover:bg-primary hover:text-white hover:border-primary transition-all">
              {f}
            </button>
          ))}
        </div>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {paginatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold">{order.customer}</div>
                      <div className="text-xs text-slate-500">{order.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{order.items} items</td>
                  <td className="px-6 py-4 font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

// ============= Task 8: Reviews Tab =============
function ReviewsTab({ initialReviews }: { initialReviews: any[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5 // Fewer reviews per page for vertical list

  const reviews = initialReviews.map(r => ({
    id: r.id,
    customer: r.profiles?.full_name || 'User',
    product: r.products?.name_en || 'Product',
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.created_at).toLocaleDateString()
  }))

  const totalPages = Math.ceil(reviews.length / pageSize)
  const paginatedReviews = reviews.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Reviews</h1>
          <p className="text-slate-500 text-sm">Monitor feedback from your customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-lg">star</span>
            <span className="font-bold text-lg">4.4</span>
            <span className="text-xs text-slate-500">avg rating</span>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {paginatedReviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {review.customer[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{review.customer}</p>
                  <p className="text-xs text-slate-500">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={`material-symbols-outlined text-sm ${star <= review.rating ? 'text-amber-500' : 'text-slate-300'}`}>star</span>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{review.product}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">Next</button>
          </div>
        )}
      </div>
    </>
  )
}
