import { createClient } from '@/utils/supabase/server'
import { AdminLayout } from './client-components'
import { redirect } from 'next/navigation'
import { getAdminMetrics } from '@/utils/supabase/queries'
import { Category, Product, Profile, Order, AppRole } from '@/utils/types'

export const revalidate = 0

export default async function AdminDashboard(props: { searchParams: Promise<{ tab?: string }>; params: Promise<{ locale: string }> }) {
  const { tab } = await props.searchParams
  const { locale } = await props.params
  const defaultTab = (tab || 'overview') as 'overview' | 'categories' | 'products' | 'users' | 'settings' | 'cms' | 'orders' | 'reviews'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const userRole = (user.app_metadata?.role as AppRole) || 'customer'
  if (!['super_admin', 'supervisor', 'employee', 'editor'].includes(userRole)) {
    redirect(`/${locale}`)
  }

  const metrics = await getAdminMetrics()

  const [
    { data: categories }, 
    { data: products }, 
    { data: settingsData }, 
    { data: profiles }, 
    { data: dynamicPages },
    { data: orders },
    { data: reviews },
    { data: profile }
  ] = await Promise.all([
    supabase.from('categories').select('id, name_en, name_ar, image_url, display_order').order('display_order'),
    supabase.from('products').select('id, name_en, price, stock, status, image_url, created_at').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('key, value'),
    supabase.from('profiles').select('id, full_name, email, role, status, created_at').order('created_at', { ascending: false }),
    supabase.from('dynamic_pages').select('id, page_name, slug, icon, display_order, status, content, content_ar').order('display_order'),
    supabase.from('orders').select('id, total_amount, status, customer_name, customer_email, created_at, profiles(full_name, email)').order('created_at', { ascending: false }).limit(50),
    supabase.from('reviews').select('id, rating, comment, created_at, profiles(full_name), products(name_en)').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('*').eq('id', user.id).single()
  ])

  const settings = settingsData?.reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value || ''
    return acc
  }, {}) || {}

  // Fix Supabase nested profile mapping for types
  const mappedOrders = (orders || []).map((o) => ({
      ...o,
      profiles: Array.isArray(o.profiles) ? o.profiles[0] : o.profiles
  })) as unknown as Order[]

  return (
    <AdminLayout
      defaultTab={defaultTab}
      locale={locale}
      profile={profile as Profile}
      email={user.email || ''}
      categories={(categories || []) as Category[]}
      products={(products || []) as Product[]}
      profiles={(profiles || []) as Profile[]}
      settings={settings}
      dynamicPages={dynamicPages || []}
      orders={mappedOrders}
      reviews={(reviews || []).map(r => ({ ...r, profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles, products: Array.isArray(r.products) ? r.products[0] : r.products })) as any}
      metrics={metrics}
    />
  )
}
