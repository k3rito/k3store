import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getCachedSettings, getCachedCategories } from '@/utils/supabase/queries'

export async function Footer({ locale }: { locale: string }) {
  const tFooter = await getTranslations('Footer')
  const settings = await getCachedSettings()
  const categories = await getCachedCategories()
  const headerTitle = settings['header_title'] || 'MedStore'

  const socialLinks = [
    { key: 'social_facebook', icon: 'social_leaderboard', label: 'Facebook' },
    { key: 'social_instagram', icon: 'linked_camera', label: 'Instagram' },
    { key: 'social_twitter', icon: 'share', label: 'Twitter' }
  ].filter(s => settings[s.key])

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link href={`/${locale}`} className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-symbols-outlined text-2xl">medical_services</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary">{headerTitle}</h1>
          </Link>
          <p className="text-slate-500 text-sm leading-relaxed">
            {tFooter('description')}
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6">{tFooter('categoriesTitle')}</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            {categories.slice(0, 4).map(cat => (
              <li key={cat.id}>
                <Link className="hover:text-primary transition-colors" href={`/${locale}/categories/${cat.id}`}>
                  {locale === 'ar' ? (cat.name_ar || cat.name_en) : cat.name_en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">{tFooter('companyTitle')}</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><Link className="hover:text-primary transition-colors" href={`/${locale}/about`}>{tFooter('aboutUs')}</Link></li>
            <li><Link className="hover:text-primary transition-colors" href={`/${locale}/b2b`}>{tFooter('b2bSolutions')}</Link></li>
            <li><Link className="hover:text-primary transition-colors" href={`/${locale}/contact`}>{tFooter('contactUs')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">{tFooter('helpCenterTitle')}</h4>
          <ul className="space-y-4 text-sm text-slate-500">
             {/* If help center routes existed, we'd link them. For now, using real paths or removing '#' links */}
            <li><Link className="hover:text-primary transition-colors" href={`/${locale}/contact`}>{tFooter('trackOrder')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 dark:border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-xs">{tFooter('copyright')}</p>
        <div className="flex items-center gap-4">
          <div className="flex gap-4">
            {socialLinks.map(social => (
              <a
                key={social.key}
                href={settings[social.key]}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
