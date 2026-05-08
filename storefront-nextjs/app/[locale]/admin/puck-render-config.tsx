import { Config } from '@measured/puck'
import DOMPurify from 'isomorphic-dompurify'
import Image from 'next/image'

type FeatureItem = {
    icon: string;
    title: string;
    description: string;
}

export const puckRenderConfig = {
    components: {
        Hero: {
            label: 'Hero Section',
            fields: {
                title: { type: 'text', label: 'Title' },
                subtitle: { type: 'text', label: 'Subtitle' },
                backgroundImage: { type: 'text', label: 'Background Image URL' },
                buttonText: { type: 'text', label: 'Button Text' },
                buttonUrl: { type: 'text', label: 'Button URL' },
            },
            defaultProps: {
                title: 'Professional Medical Solutions',
                subtitle: 'Equipping the healthcare industry with premium certified technology.',
                backgroundImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA588kmX3DwQmk8CXW0UBebTd55zzzhpA7mMy0ju3f0kv_c8ix9FzrrrgA9f3va_PFneZYJz2F-ZyfvdJgwFY6UXBSf06L8REpaxm9ppZev9Ut6_9_ZfA1I5rcJbLsgB6se5hQGpwIbaVNJSUr6_n0Q8BE5l7l5awJ_VBBzTEEBIENQtZbnrVAm0jbGIEPBwHvCPkTZHlhXl-RWE0blFZelR_qoOpXGD5As0asfd8vt8QL3-9VyrfoXPb93TKh0AC3NLo5Ccak8uPo',
                buttonText: 'Shop Products',
                buttonUrl: '/products',
            },
            render: ({ title, subtitle, backgroundImage, buttonText, buttonUrl }: any) => (
                <section className="relative overflow-hidden min-h-[400px] bg-slate-900 flex items-center max-w-7xl">
                    {backgroundImage && (
                        <div className="absolute inset-0">
                            <Image alt="Hero" fill className="object-cover opacity-60" src={backgroundImage} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex flex-col justify-center px-8 md:px-16 w-full h-full">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white max-w-lg leading-tight font-[Manrope]">{title}</h2>
                        <p className="text-white/90 mt-4 max-w-md text-sm md:text-base">{subtitle}</p>
                        {buttonText && (
                            <div className="mt-8">
                                <a href={buttonUrl} className="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-lg inline-block">
                                    {buttonText}
                                </a>
                            </div>
                        )}
                    </div>
                </section>
            ),
        },
        FeatureGrid: {
            label: 'Feature Grid',
            fields: {
                heading: { type: 'text', label: 'Heading' },
                columns: {
                    type: 'select',
                    label: 'Columns',
                    options: [
                        { label: '2 Columns', value: '2' },
                        { label: '3 Columns', value: '3' },
                        { label: '4 Columns', value: '4' },
                    ],
                },
                items: {
                    type: 'list',
                    label: 'Features',
                    arrayFields: {
                        icon: { type: 'text', label: 'Material Icon Name' },
                        title: { type: 'text', label: 'Title' },
                        description: { type: 'textarea', label: 'Description' },
                    },
                },
            },
            defaultProps: {
                heading: 'Why Choose Us',
                columns: '3',
                items: [
                    { icon: 'verified_user', title: 'Certified Equipment', description: 'All products meet international medical standards.' },
                    { icon: 'local_shipping', title: 'Fast Delivery', description: 'Same-day dispatch on in-stock items.' },
                    { icon: 'support_agent', title: '24/7 Support', description: 'Our medical experts are always available.' },
                ],
            },
            render: ({ heading, columns, items }: any) => (
                <section className="max-w-7xl mx-auto px-4 py-12">
                    {heading && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold font-[Manrope]">{heading}</h3>
                            <div className="h-1 w-12 bg-primary mt-2" />
                        </div>
                    )}
                    <div className={`grid gap-6 ${columns === '2' ? 'grid-cols-1 md:grid-cols-2' : columns === '4' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {(items || []).map((item: FeatureItem, i: number) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
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
            label: 'Rich Text',
            fields: {
                content: { type: 'textarea', label: 'HTML Content' },
            },
            defaultProps: {
                content: '<h2>About Our Medical Solutions</h2><p>We provide high-quality medical equipment for hospitals, clinics, and healthcare professionals worldwide. Our products are certified and backed by a comprehensive warranty.</p>',
            },
            render: ({ content }: any) => {
                const sanitized = DOMPurify.sanitize(content || '')
                return (
                    <section className="max-w-4xl mx-auto px-4 py-8">
                        <div
                            className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-[Manrope] prose-h2:text-2xl prose-h2:font-bold prose-p:leading-relaxed prose-a:text-primary prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: sanitized }}
                        />
                    </section>
                )
            },
        },
        ImageBlock: {
            label: 'Image',
            fields: {
                imageUrl: { type: 'text', label: 'Image URL' },
                alt: { type: 'text', label: 'Alt Text' },
                caption: { type: 'text', label: 'Caption' },
                width: {
                    type: 'select',
                    label: 'Width',
                    options: [
                        { label: 'Full Width', value: 'full' },
                        { label: 'Medium (75%)', value: 'medium' },
                        { label: 'Small (50%)', value: 'small' },
                    ],
                },
            },
            defaultProps: {
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXIHkomRi97eLWGNaT6ePbaNe0EKeVIWmOSvhZmdSdXMCgPpLzEIOwXpITrPeLj8ttoagQPtI-tVR6vN2SGCHVKpRI0TQjZ0Nz8XsM_viFzcWR1OdE5CwDxsVkam7DuYpvalTNN-BCwOZhBsN9TMoBtuEZXDp6qi26R-yT9bcCMR5WO6jD4KP0R6mfM95tH--lIXI7KMpYt9cQ6CoJGd2uBlgnILinBEyWtoSKllFe4gAt_PX59Z05aFH_HFhNa5rw6ptr9o2smow',
                alt: 'Medical equipment showcase',
                caption: '',
                width: 'full',
            },
            render: ({ imageUrl, alt, caption, width }: any) => (
                <figure className={`mx-auto px-4 py-4 ${width === 'small' ? 'max-w-xl' : width === 'medium' ? 'max-w-4xl' : 'max-w-7xl'}`}>
                    <div className="relative aspect-video w-full">
                        {imageUrl && (
                            <Image alt={alt} src={imageUrl} fill className="rounded-xl shadow-sm object-cover" />
                        )}
                    </div>
                    {caption && (
                        <figcaption className="text-center text-sm text-slate-500 mt-3 font-[Manrope]">{caption}</figcaption>
                    )}
                </figure>
            ),
        },
        ButtonLink: {
            label: 'Button / CTA',
            fields: {
                label: { type: 'text', label: 'Button Label' },
                url: { type: 'text', label: 'URL' },
                variant: {
                    type: 'select',
                    label: 'Style',
                    options: [
                        { label: 'Primary (Solid)', value: 'primary' },
                        { label: 'Outline', value: 'outline' },
                        { label: 'Dark', value: 'dark' },
                    ],
                },
            },
            defaultProps: {
                label: 'Get Started',
                url: '/contact',
                variant: 'primary',
            },
            render: ({ label, url, variant }: any) => {
                const styles: Record<string, string> = {
                    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25',
                    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
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
            label: 'Spacer',
            fields: {
                height: {
                    type: 'select',
                    label: 'Height',
                    options: [
                        { label: 'Small (16px)', value: 'sm' },
                        { label: 'Medium (32px)', value: 'md' },
                        { label: 'Large (64px)', value: 'lg' },
                        { label: 'Extra Large (96px)', value: 'xl' },
                    ],
                },
            },
            defaultProps: {
                height: 'md',
            },
            render: ({ height }: any) => {
                const sizes: Record<string, string> = { sm: 'h-4', md: 'h-8', lg: 'h-16', xl: 'h-24' }
                return <div className={`${sizes[height] || sizes.md} w-full`} />
            },
        },
    },
} as Config
