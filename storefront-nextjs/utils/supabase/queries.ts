import { createClient } from '@/utils/supabase/server'
import { unstable_cache } from 'next/cache'

/**
 * CACHE TAGS:
 * - 'products'
 * - 'categories'
 * - 'dynamic_pages'
 * - 'site_settings'
 */

export const getCachedProducts = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name_en, name_ar)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
  ['products-list'],
  { tags: ['products'], revalidate: 3600 }
)

export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  },
  ['categories-list'],
  { tags: ['categories'], revalidate: 3600 }
)

export const getCachedPage = (slug: string) => unstable_cache(
  async () => {
    const supabase = await createClient()
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
    const supabase = await createClient()
    const { data, error } = await supabase.from('site_settings').select('*')
    if (error) return {}
    
    return data.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.key] = curr.value || ''
      return acc
    }, {})
  },
  ['site-settings'],
  { tags: ['site_settings'], revalidate: 3600 }
)
