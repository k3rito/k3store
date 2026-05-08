import { createClient } from '@/utils/supabase/server'
import { Render } from '@puckeditor/core'
import { puckRenderConfig } from '@/app/[locale]/admin/puck-render-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const revalidate = 0

interface PuckData {
  content: any[];
  root: Record<string, any>;
}

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

    const { data: pageBySlug, error: slugError } = await supabase
        .from('dynamic_pages')
        .select('*')
        .eq('slug', slug)
        .single()

    let page = pageBySlug

    if (slugError || !page) {
        const { data: customPage } = await supabase
            .from('dynamic_pages')
            .select('*')
            .eq('custom_slug', slug)
            .single()
        if (customPage) page = customPage
        else notFound()
    }

    const isArabic = locale === 'ar'
    const rawContent = isArabic ? (page.content_ar || page.content) : page.content

    let puckData: PuckData = { content: [], root: {} }
    if (rawContent && typeof rawContent === 'object') {
        const obj = rawContent as Record<string, any>
        if ('content' in obj && 'root' in obj) {
            puckData = obj as unknown as PuckData
        } else if ('content' in obj) {
            puckData = { content: obj.content, root: obj.root || {} }
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header locale={locale} />

            <div className="max-w-7xl mx-auto px-4 py-12 w-full">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white">{page.page_name}</h1>
                <div className="h-2 w-20 bg-primary rounded-full mt-4" />
            </div>

            <main className="flex-grow pb-24">
                {puckData.content && puckData.content.length > 0 ? (
                    <Render config={puckRenderConfig as any} data={puckData as any} />
                ) : (
                    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-6 block">construction</span>
                        <h2 className="font-bold text-2xl text-slate-500">This page is being built</h2>
                        <p className="text-slate-400 mt-2">Content will appear here once the administrator publishes it.</p>
                    </div>
                )}
            </main>

            <Footer locale={locale} />
        </div>
    )
}
