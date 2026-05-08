import { createStaticClient, createClient } from '@/utils/supabase/server'
import { unstable_cache } from 'next/cache'
import { Product, Category } from '@/utils/types'

/**
 * CACHE TAGS:
 * - 'products'
 * - 'categories'
 * - 'dynamic_pages'
 * - 'site_settings'
 */

export const getCachedProducts = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name_en, name_ar)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []) as Product[]
  },
  ['products-list'],
  { tags: ['products'], revalidate: 3600 }
)

export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return (data || []) as Category[]
  },
  ['categories-list'],
  { tags: ['categories'], revalidate: 3600 }
)

export const getCachedPage = (slug: string) => unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data, error } = await supabase
      .from('dynamic_pages')
      .select('*')
      .or(`slug.eq.${slug},custom_slug.eq.${slug}`)
      .single()
    
    if (error) return null
    return data
  },
  [`page-${slug}`],
  { tags: ['dynamic_pages', `page-${slug}`], revalidate: 3600 }
)()

export const getCachedSettings = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data, error } = await supabase.from('site_settings').select('*')
    if (error || !data) return {}
    
    return data.reduce((acc: Record<string, string>, curr: { key: string, value: string | null }) => {
      acc[curr.key] = curr.value || ''
      return acc
    }, {})
  },
  ['site-settings'],
  { tags: ['site_settings'], revalidate: 3600 }
)

// ── Admin-only queries (Not cached) ──

export async function getAdminMetrics() {
    const supabase = await createClient()

    // Check role before execution
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !['super_admin', 'supervisor', 'employee'].includes(user.app_metadata?.role)) {
        throw new Error('Unauthorized')
    }

    const [
        { count: totalProducts },
        { count: totalOrders },
        { data: revenueData },
        { count: activeStaff }
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'Active')
    ])

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0

    return {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        activeStaff: activeStaff || 0
    }
}
