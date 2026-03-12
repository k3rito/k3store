// Puck Render Config — used by the public storefront to render pages
// This is a SERVER-SAFE file (no 'use client' needed, <Render> works in RSC)

import type { Config } from '@puckeditor/core'

// ── Render-only config: same components, no editor overhead ──

export const puckRenderConfig: Config = {
    components: {
        HeroBanner: {
            render: ({ title, subtitle, buttonText, buttonUrl, backgroundImage }: any) => (
                <section className="relative overflow-hidden rounded-2xl aspect-[21/9] min-h-[280px] bg-slate-800 flex items-center my-4 mx-auto max-w-7xl">
                    {backgroundImage && (
                        <img alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" src={backgroundImage} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0054a3]/80 to-transparent flex flex-col justify-center px-8 md:px-16 w-full h-full">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white max-w-lg leading-tight font-[Manrope]">{title}</h2>
                        <p className="text-white/90 mt-4 max-w-md text-sm md:text-base">{subtitle}</p>
                        {buttonText && (
                            <div className="mt-8">
                                <a href={buttonUrl} className="bg-white text-[#0054a3] px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-lg inline-block">
                                    {buttonText}
                                </a>
                            </div>
                        )}
                    </div>
                </section>
            ),
        },

        FeatureGrid: {
            render: ({ heading, columns, items }: any) => (
                <section className="max-w-7xl mx-auto px-4 py-12">
                    {heading && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold font-[Manrope]">{heading}</h3>
                            <div className="h-1 w-12 bg-[#0054a3] mt-2" />
                        </div>
                    )}
                    <div className={`grid gap-6 ${columns === '2' ? 'grid-cols-1 md:grid-cols-2' : columns === '4' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {(items || []).map((item: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-[#0054a3]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-[#0054a3] text-2xl">{item.icon}</span>
                                </div>
                                <h4 className="font-bold text-base mb-2 font-[Manrope]">{item.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ),
        },

        RichText: {
            render: ({ content }: any) => (
                <section className="max-w-4xl mx-auto px-4 py-8">
                    <div
                        className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-[Manrope] prose-h2:text-2xl prose-h2:font-bold prose-p:leading-relaxed prose-a:text-[#0054a3] prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </section>
            ),
        },

        ImageBlock: {
            render: ({ imageUrl, alt, caption, width }: any) => (
                <figure className={`mx-auto px-4 py-4 ${width === 'small' ? 'max-w-xl' : width === 'medium' ? 'max-w-4xl' : 'max-w-7xl'}`}>
                    {imageUrl && (
                        <img alt={alt} src={imageUrl} className="w-full rounded-xl shadow-sm object-cover" />
                    )}
                    {caption && (
                        <figcaption className="text-center text-sm text-slate-500 mt-3 font-[Manrope]">{caption}</figcaption>
                    )}
                </figure>
            ),
        },

        ButtonLink: {
            render: ({ label, url, variant }: any) => {
                const styles: Record<string, string> = {
                    primary: 'bg-[#0054a3] text-white hover:bg-[#0054a3]/90 shadow-lg shadow-[#0054a3]/25',
                    outline: 'border-2 border-[#0054a3] text-[#0054a3] hover:bg-[#0054a3]/10',
                    dark: 'bg-slate-900 text-white hover:bg-slate-800',
                }
                return (
                    <div className="flex justify-center py-4 px-4">
                        <a
                            href={url}
                            className={`inline-block px-8 py-3 rounded-xl font-bold text-sm transition-all font-[Manrope] ${styles[variant] || styles.primary}`}
                        >
                            {label}
                        </a>
                    </div>
                )
            },
        },

        Spacer: {
            render: ({ height }: any) => {
                const sizes: Record<string, string> = { sm: 'h-4', md: 'h-8', lg: 'h-16', xl: 'h-24' }
                return <div className={`${sizes[height] || sizes.md} w-full`} />
            },
        },
    },
}
