import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SidebarDrawer, HeaderActions } from '@/app/[locale]/client-components'
import { createClient } from '@/utils/supabase/server'
import { getCachedSettings } from '@/utils/supabase/queries'

export async function Header({ locale }: { locale: string }) {
  const tNav = await getTranslations('Navigation')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'user'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) userRole = profile.role as string
  }

  const settings = await getCachedSettings()
  const headerTitle = settings['header_title'] || 'MedStore'

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <SidebarDrawer user={user ? { id: user.id, email: user.email } : null} userRole={userRole} />
            <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined text-xl sm:text-2xl">medical_services</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-primary">{headerTitle}</h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" href={`/${locale}`}>{tNav('home')}</Link>
            <Link className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" href={`/${locale}/about`}>{tNav('about')}</Link>
            <Link className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" href={`/${locale}/contact`}>{tNav('contact')}</Link>
            <Link className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" href={`/${locale}/b2b`}>{tNav('b2b')}</Link>
          </nav>

          <HeaderActions user={user ? { id: user.id, email: user.email } : null} userRole={userRole} />
        </div>
      </div>
    </header>
  )
}
