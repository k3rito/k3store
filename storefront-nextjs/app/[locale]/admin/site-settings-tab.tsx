'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Puck } from '@puckeditor/core'
import '@puckeditor/core/dist/index.css'
import { puckConfig } from './puck-config'
import { puckRenderConfig } from './puck-render-config'
import { Render } from '@puckeditor/core'
import { saveDynamicPage, createDynamicPage, deleteDynamicPage, approvePage, rejectPage } from './actions'

// ── Types ──
type AppRole = 'super_admin' | 'supervisor' | 'employee' | 'editor' | 'user'

interface DynamicPage {
    id: string
    page_name: string
    slug: string
    icon: string
    display_order: number
    content: any
    content_ar: any
    status: 'draft' | 'pending_approval' | 'published'
    meta_title?: string
    meta_description?: string
    custom_slug?: string
}

// ── Toast ──
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500)
        return () => clearTimeout(t)
    }, [onClose])
    const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-primary' }
    const icons = { success: 'check_circle', error: 'error', info: 'info' }
    return (
        <div className={`fixed bottom-6 right-6 z-[200] animate-toast-in flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white ${colors[type]}`}>
            <span className="material-symbols-outlined text-lg">{icons[type]}</span>
            {message}
        </div>
    )
}

// ── New Page Dialog ──
function NewPageDialog({ onClose, onSubmit, loading }: { onClose: () => void; onSubmit: (name: string, slug: string, icon: string) => void; loading: boolean }) {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [icon, setIcon] = useState('description')
    const handleNameChange = (v: string) => {
        setName(v)
        setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-lg">Create New Page</h2>
                    <button disabled={loading} onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Page Name *</label>
                        <input value={name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. Privacy Policy" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
                        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-mono" placeholder="privacy-policy" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Icon</label>
                        <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="description" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button disabled={loading || !name.trim() || !slug.trim()} onClick={() => onSubmit(name, slug, icon)} className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow">{loading ? 'Creating...' : 'Create Page'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Delete Confirm Dialog ──
function DeleteConfirmDialog({ pageName, onClose, onConfirm, loading }: { pageName: string; onClose: () => void; onConfirm: () => void; loading: boolean }) {
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
                    </div>
                    <h2 className="font-bold text-lg">Delete &quot;{pageName}&quot;?</h2>
                    <p className="text-slate-500 text-sm">This will permanently delete the page and all its content.</p>
                    <div className="flex justify-center gap-3 pt-2">
                        <button disabled={loading} onClick={onClose} className="px-5 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button disabled={loading} onClick={onConfirm} className="px-5 py-2 bg-red-500 text-white font-bold text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 shadow">{loading ? 'Deleting...' : 'Delete Page'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Page Selector Modal ──
function PageSelectorModal({ pages, onSelect, onClose, title, subtitle }: { pages: DynamicPage[]; onSelect: (page: DynamicPage) => void; onClose: () => void; title: string; subtitle: string }) {
    const storefrontIcons: Record<string, string> = { home: 'home', about: 'info', 'about-us': 'info', contact: 'call', products: 'shopping_bag', 'b2b-portal': 'business', 'b2b': 'business_center', footer: 'dock' }
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex flex-col items-center pt-3 pb-2 sm:hidden"><div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div></div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div><h3 className="text-xl font-bold">{title}</h3><p className="text-slate-500 text-sm">{subtitle}</p></div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {pages.map(page => (
                        <button key={page.id} onClick={() => onSelect(page)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400">{storefrontIcons[page.slug] || page.icon}</span>
                                <div className="text-left">
                                    <span className="font-medium block">{page.page_name}</span>
                                    <span className="text-xs text-slate-400">/{page.slug}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {page.status === 'pending_approval' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Pending</span>}
                                {page.status === 'draft' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">Draft</span>}
                                {page.status === 'published' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Live</span>}
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-lg">chevron_right</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── SEO Settings Panel ──
function SeoPanel({ page, onChange, onClose }: { page: DynamicPage; onChange: (field: string, value: string) => void; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-primary/5">
                    <div>
                        <h2 className="font-bold text-lg flex items-center gap-2"><span className="material-symbols-outlined text-primary">travel_explore</span>SEO Settings</h2>
                        <p className="text-xs text-slate-500">{page.page_name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
                        <input value={page.meta_title || ''} onChange={e => onChange('meta_title', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Page title for search engines" />
                        <p className="text-[10px] text-slate-400 mt-1">{(page.meta_title || '').length}/60 characters</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
                        <textarea value={page.meta_description || ''} onChange={e => onChange('meta_description', e.target.value)} rows={3} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Brief summary for search results" />
                        <p className="text-[10px] text-slate-400 mt-1">{(page.meta_description || '').length}/155 characters</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Slug</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">/p/</span>
                            <input value={page.custom_slug || ''} onChange={e => onChange('custom_slug', e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-mono" placeholder={page.slug} />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 shadow">Done</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Live Preview Overlay ──
function LivePreview({ data, onClose }: { data: any; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">visibility</span>
                    <h3 className="font-bold text-sm">Live Preview</h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Live</span>
                </div>
                <button onClick={onClose} className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span> Exit Preview
                </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
                <Render config={puckRenderConfig} data={data} />
            </div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════════
// ██  MAIN CMS BUILDER TAB
// ══════════════════════════════════════════════════════════════
export default function SiteSettingsTab({ initialPages, userRole }: { initialPages: DynamicPage[]; userRole: AppRole }) {
    const [pages, setPages] = useState<DynamicPage[]>(initialPages)
    const [activePageId, setActivePageId] = useState<string>(initialPages[0]?.id || '')
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
    const [showNewPageDialog, setShowNewPageDialog] = useState(false)
    const [showDeleteSelector, setShowDeleteSelector] = useState(false)
    const [showEditSelector, setShowEditSelector] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<DynamicPage | null>(null)
    const [dialogLoading, setDialogLoading] = useState(false)
    const [showSeoPanel, setShowSeoPanel] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [previewData, setPreviewData] = useState<any>(null)
    const [editorLang, setEditorLang] = useState<'en' | 'ar'>('en')

    const activePage = pages.find(p => p.id === activePageId)
    const isEditor = userRole === 'editor'
    const isAdmin = userRole === 'super_admin' || userRole === 'supervisor'

    // Refs for stale closure prevention
    const activePageRef = useRef(activePage)
    const pagesRef = useRef(pages)
    const langRef = useRef(editorLang)
    useEffect(() => { activePageRef.current = activePage }, [activePage])
    useEffect(() => { pagesRef.current = pages }, [pages])
    useEffect(() => { langRef.current = editorLang }, [editorLang])

    // Build Puck data from the page
    const getPuckData = useCallback((page: DynamicPage | undefined, lang: 'en' | 'ar') => {
        if (!page) return { content: [], root: {} }
        const raw = lang === 'ar' ? page.content_ar : page.content
        if (raw && typeof raw === 'object' && 'content' in raw && 'root' in raw) return raw
        return { content: [], root: {} }
    }, [])

    // ── Publish / Submit handler ──
    const handlePublish = useCallback(async (data: any) => {
        const currentPage = activePageRef.current
        const currentLang = langRef.current
        if (!currentPage) return
        try {
            const result = await saveDynamicPage(currentPage.id, {
                page_name: currentPage.page_name,
                slug: currentPage.slug,
                icon: currentPage.icon,
                display_order: currentPage.display_order,
                content: data,
                language: currentLang,
                meta_title: currentPage.meta_title,
                meta_description: currentPage.meta_description,
                custom_slug: currentPage.custom_slug,
            })
            const newStatus = result.status as DynamicPage['status']
            setPages(prev => prev.map(p => p.id === currentPage.id ? {
                ...p,
                ...(currentLang === 'ar' ? { content_ar: data } : { content: data }),
                status: newStatus,
            } : p))
            if (newStatus === 'pending_approval') {
                setToast({ message: `"${currentPage.page_name}" submitted for review!`, type: 'info' })
            } else {
                setToast({ message: `"${currentPage.page_name}" (${currentLang.toUpperCase()}) published!`, type: 'success' })
            }
        } catch (err: any) {
            setToast({ message: err?.message || 'Failed to publish', type: 'error' })
        }
    }, [])

    // ── Approve / Reject ──
    const handleApprove = async (pageId: string) => {
        try {
            await approvePage(pageId)
            setPages(prev => prev.map(p => p.id === pageId ? { ...p, status: 'published' } : p))
            setToast({ message: 'Page approved and published!', type: 'success' })
        } catch (err: any) { setToast({ message: err?.message || 'Failed to approve', type: 'error' }) }
    }
    const handleReject = async (pageId: string) => {
        try {
            await rejectPage(pageId)
            setPages(prev => prev.map(p => p.id === pageId ? { ...p, status: 'draft' } : p))
            setToast({ message: 'Page rejected and moved to draft.', type: 'info' })
        } catch (err: any) { setToast({ message: err?.message || 'Failed to reject', type: 'error' }) }
    }

    // ── Create Page ──
    const handleCreatePage = async (name: string, slug: string, icon: string) => {
        setDialogLoading(true)
        try {
            const newPage = await createDynamicPage(name, slug, icon)
            const withDefaults = { ...newPage, content: { content: [], root: {} }, content_ar: { content: [], root: {} }, status: 'draft' as const }
            setPages(prev => [...prev, withDefaults])
            setActivePageId(newPage.id)
            setShowNewPageDialog(false)
            setToast({ message: `Page "${name}" created!`, type: 'success' })
        } catch (err: any) { setToast({ message: err?.message || 'Failed to create', type: 'error' }) } finally { setDialogLoading(false) }
    }

    // ── Delete Page ──
    const handleDeletePage = async () => {
        const target = deleteTarget
        if (!target) return
        setDialogLoading(true)
        try {
            await deleteDynamicPage(target.id)
            const remaining = pages.filter(p => p.id !== target.id)
            setPages(remaining)
            if (activePageId === target.id && remaining.length > 0) setActivePageId(remaining[0].id)
            setShowDeleteConfirm(false); setDeleteTarget(null)
            setToast({ message: 'Page deleted', type: 'success' })
        } catch (err: any) { setToast({ message: err?.message || 'Failed to delete', type: 'error' }) } finally { setDialogLoading(false) }
    }

    // ── SEO field change ──
    const handleSeoChange = (field: string, value: string) => {
        if (!activePage) return
        setPages(prev => prev.map(p => p.id === activePage.id ? { ...p, [field]: value } : p))
    }

    // ── Live Preview ──
    const openPreview = () => {
        if (!activePage) return
        setPreviewData(getPuckData(activePage, editorLang))
        setShowPreview(true)
    }

    // ── Role-based page filtering for selectors ──
    const getFilteredPages = () => {
        if (userRole === 'super_admin' || userRole === 'supervisor') return pages
        // editors see all content pages
        return pages
    }

    // Pending pages count for notification
    const pendingCount = pages.filter(p => p.status === 'pending_approval').length

    // Status badge
    const statusBadge = (status: string) => {
        const s: Record<string, { bg: string; text: string; label: string }> = {
            published: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Live' },
            pending_approval: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
            draft: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Draft' },
        }
        const st = s[status] || s.draft
        return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${st.bg} ${st.text}`}>{st.label}</span>
    }

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
            {/* ── CMS Builder Header (Phase 3 Toolbar) ── */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm rounded-t-xl overflow-hidden flex-shrink-0">
                <div className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold leading-tight tracking-tight">CMS Builder</h1>
                            <p className="text-slate-500 text-sm mt-1">Manage and organize your site pages and content structure.</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* i18n Language Toggle (Phase 6) */}
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                                <button onClick={() => setEditorLang('en')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${editorLang === 'en' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}>
                                    EN
                                </button>
                                <button onClick={() => setEditorLang('ar')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${editorLang === 'ar' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}>
                                    AR
                                </button>
                            </div>

                            {/* Compact 3-Icon Toolbar (Phase 3) */}
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
                                <button onClick={() => setShowNewPageDialog(true)} className="flex items-center justify-center w-10 h-10 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Add Page">
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
                                <button onClick={() => setShowEditSelector(true)} className={`flex items-center justify-center w-10 h-10 rounded-lg text-primary transition-colors ${showEditSelector ? 'bg-primary/10' : 'hover:bg-primary/10'}`} title="Edit Pages">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
                                <button onClick={() => setShowDeleteSelector(true)} className="flex items-center justify-center w-10 h-10 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Page">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>

                            {/* SEO Button (Phase 7) */}
                            <button onClick={() => activePage && setShowSeoPanel(true)} disabled={!activePage} className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-primary hover:bg-primary/10 transition-colors disabled:opacity-40" title="SEO Settings">
                                <span className="material-symbols-outlined">travel_explore</span>
                            </button>

                            {/* Live Preview Button (Phase 4) */}
                            <button onClick={openPreview} disabled={!activePage} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-sm transition-colors disabled:opacity-40" title="Live Preview">
                                <span className="material-symbols-outlined text-sm">visibility</span> Preview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active page indicator + approval controls */}
                {activePage && (
                    <div className="px-4 sm:px-6 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-sm">{activePage.icon}</span>
                            <span className="font-bold text-sm">{activePage.page_name}</span>
                            {statusBadge(activePage.status)}
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{editorLang === 'ar' ? 'Arabic' : 'English'}</span>
                        </div>
                        {/* Approval buttons for admins on pending pages */}
                        {isAdmin && activePage.status === 'pending_approval' && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleApprove(activePage.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">check</span> Approve
                                </button>
                                <button onClick={() => handleReject(activePage.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">close</span> Reject
                                </button>
                            </div>
                        )}
                        {/* Pending count for admins */}
                        {isAdmin && pendingCount > 0 && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">pending_actions</span> {pendingCount} pending
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Puck Editor ── */}
            <div className="flex-1 min-h-0">
                {activePage ? (
                    <Puck
                        key={activePageId + '-' + editorLang}
                        config={puckConfig}
                        data={getPuckData(activePage, editorLang)}
                        onPublish={handlePublish}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-slate-50">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">dashboard_customize</span>
                            <h3 className="font-bold text-lg text-slate-600">No pages yet</h3>
                            <p className="text-slate-400 text-sm mt-1">Click the &quot;+&quot; button to create your first page.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Dialogs ── */}
            {showNewPageDialog && <NewPageDialog onClose={() => setShowNewPageDialog(false)} onSubmit={handleCreatePage} loading={dialogLoading} />}

            {showEditSelector && (
                <PageSelectorModal
                    pages={getFilteredPages()}
                    onSelect={(page) => { setActivePageId(page.id); setShowEditSelector(false) }}
                    onClose={() => setShowEditSelector(false)}
                    title="Page Selector"
                    subtitle="Select a page to edit content"
                />
            )}

            {showDeleteSelector && (
                <PageSelectorModal
                    pages={getFilteredPages()}
                    onSelect={(page) => { setDeleteTarget(page); setShowDeleteSelector(false); setShowDeleteConfirm(true) }}
                    onClose={() => setShowDeleteSelector(false)}
                    title="Delete Page"
                    subtitle="Select a page to delete"
                />
            )}

            {showDeleteConfirm && deleteTarget && (
                <DeleteConfirmDialog pageName={deleteTarget.page_name} onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null) }} onConfirm={handleDeletePage} loading={dialogLoading} />
            )}

            {showSeoPanel && activePage && (
                <SeoPanel page={activePage} onChange={handleSeoChange} onClose={() => setShowSeoPanel(false)} />
            )}

            {showPreview && previewData && <LivePreview data={previewData} onClose={() => setShowPreview(false)} />}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}
