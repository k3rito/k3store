import { createClient } from '@/utils/supabase/server'
import { AdminLayout } from './client-components'
import { redirect } from 'next/navigation' // Built-in Next.js redirect with locale prefixes from middleware

export const revalidate = 0 // always fetch fresh data for admin

export default async function AdminDashboard(props: { searchParams: Promise<{ tab?: string }>; params: Promise<{ locale: string }> }) {
  const { tab } = await props.searchParams
  const { locale } = await props.params
  const defaultTab = tab || 'overview'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (!['super_admin', 'supervisor', 'employee', 'editor'].includes(profile?.role)) {
    redirect(`/${locale}`)
  }

  // Fetch all necessary data
  const [{ data: categories }, { data: products }, { data: settingsData }, { data: profiles }, { data: dynamicPages }] = await Promise.all([
    supabase.from('categories').select('*').order('display_order'),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('*'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('dynamic_pages').select('*').order('display_order')
  ])

  const settings = settingsData?.reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value || ''
    return acc
  }, {}) || {}

  return (
    <AdminLayout
      defaultTab={defaultTab as any}
      locale={locale}
      profile={profile}
      email={user.email || ''}
      categories={categories || []}
      products={products || []}
      profiles={profiles || []}
      settings={settings}
      dynamicPages={dynamicPages || []}
    />
  )
}
