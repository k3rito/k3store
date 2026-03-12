import { createClient } from '@/utils/supabase/server'
import { Render } from '@puckeditor/core'
import { puckRenderConfig } from '@/app/[locale]/admin/puck-render-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 0

// ── Phase 7: SEO generateMetadata ──
export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
    const { slug } = await props.params
    const supabase = await createClient()
    const { data: page } = await supabase.from('dynamic_pages').select('page_name, meta_title, meta_description, custom_slug').eq('slug', slug).single()
    if (!page) return {}
    return {
        title: page.meta_title || page.page_name,
        description: page.meta_description || `${page.page_name} page`,
    }
}

export default async function DynamicPage(props: { params: Promise<{ locale: string; slug: string }> }) {
    const { locale, slug } = await props.params
    const supabase = await createClient()

    // Fetch the page by slug (also check custom_slug)
    let { data: page, error } = await supabase
        .from('dynamic_pages')
        .select('*')
        .eq('slug', slug)
        .single()

    // Fallback: try custom_slug
    if (error || !page) {
        const { data: customPage } = await supabase
            .from('dynamic_pages')
            .select('*')
            .eq('custom_slug', slug)
            .single()
        if (customPage) page = customPage
        else notFound()
    }

    // ── Phase 6: Locale-aware content ──
    const isArabic = locale === 'ar'
    const rawContent = isArabic ? (page.content_ar || page.content) : page.content

    const puckData = rawContent && typeof rawContent === 'object' && 'content' in rawContent && 'root' in rawContent
        ? rawContent
        : { content: [], root: {} }

    // Fetch site settings for header
    const { data: settingsData } = await supabase.from('site_settings').select('*')
    const settings = settingsData?.reduce((acc: Record<string, string>, curr: any) => {
        acc[curr.key] = curr.value || ''
        return acc
    }, {}) || {}
    const headerTitle = settings['header_title'] || 'MedStore'

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'}>
            {/* Simple header for CMS pages */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="bg-primary p-1.5 rounded-lg text-white">
                                <span className="material-symbols-outlined text-xl">medical_services</span>
                            </div>
                            <h1 className="text-lg font-bold tracking-tight text-primary">{headerTitle}</h1>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href={`/${locale}`}>Home</Link>
                            <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href={`/${locale}/about`}>About</Link>
                            <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href={`/${locale}/contact`}>Contact</Link>
                        </nav>
                        <Link href={`/${locale}`} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page title */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{page.page_name}</h1>
                <div className="h-1 w-16 bg-primary mt-3" />
            </div>

            {/* Rendered Puck content */}
            <main className="min-h-[50vh] pb-16">
                {puckData.content && puckData.content.length > 0 ? (
                    <Render config={puckRenderConfig} data={puckData} />
                ) : (
                    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">construction</span>
                        <h2 className="font-bold text-lg text-slate-500">This page is being built</h2>
                        <p className="text-slate-400 text-sm mt-2">Content will appear here once the administrator publishes it.</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
                    © {new Date().getFullYear()} {headerTitle}. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
