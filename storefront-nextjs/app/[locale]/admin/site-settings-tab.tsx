'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Puck, Config, Data, Render } from '@puckeditor/core'
import { puckRenderConfig } from './puck-render-config'
import { saveDynamicPage, approvePage, rejectPage, createDynamicPage, deleteDynamicPage, AppRole } from './actions'
import { useRouter } from 'next/navigation'

// ── Types ──
interface DynamicPage {
    id: string
    page_name: string
    slug: string
    icon: string
    display_order: number
    content: any
    content_ar?: any
    status: 'draft' | 'pending_approval' | 'published'
    updated_at: string
    updated_by: string
}

// ── Component: CMS Builder Wrapper ──
export default function CMSBuilder({
    pages,
    isAdmin,
    locale
}: {
    pages: any[],
    isAdmin: boolean,
    locale: string
}) {
    const router = useRouter()
    const [activePageId, setActivePageId] = useState<string | null>(pages[0]?.id || null)
    const [editorLang, setEditorLang] = useState<'en' | 'ar'>(locale as 'en' | 'ar' || 'en')
    const [showNewPageDialog, setShowNewPageDialog] = useState(false)
    const [dialogLoading, setDialogLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const activePage = pages.find(p => p.id === activePageId)

    const handlePublish = useCallback(async (data: Data) => {
        if (!activePageId) return
        try {
            const { status } = await saveDynamicPage(activePageId, {
                page_name: activePage!.page_name,
                slug: activePage!.slug,
                icon: activePage!.icon,
                display_order: activePage!.display_order,
                content: data,
                language: editorLang
            })
            setToast({ message: status === 'published' ? 'Page published!' : 'Sent for approval.', type: 'success' })
            router.refresh()
        } catch (err: any) {
            setToast({ message: err.message, type: 'error' })
        }
    }, [activePageId, activePage, editorLang, router])

    const handleCreatePage = async (name: string, slug: string, icon: string) => {
        setDialogLoading(true)
        try {
            const newPage = await createDynamicPage(name, slug, icon)
            setActivePageId(newPage.id)
            setShowNewPageDialog(false)
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setDialogLoading(false)
        }
    }

    const puckData = activePage ? (editorLang === 'ar' ? (activePage.content_ar || { content: [], root: {} }) : (activePage.content || { content: [], root: {} })) : { content: [], root: {} }

    return (
        <div className="flex flex-col h-[calc(100vh-160px)]">
            <header className="bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <select
                        value={activePageId || ''}
                        onChange={e => setActivePageId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg font-bold text-sm"
                    >
                        {pages.map(p => <option key={p.id} value={p.id}>{p.page_name}</option>)}
                    </select>
                    <button onClick={() => setShowNewPageDialog(true)} className="text-primary material-symbols-outlined">add_circle</button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setEditorLang('en')} className={`px-3 py-1 rounded ${editorLang === 'en' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>EN</button>
                    <button onClick={() => setEditorLang('ar')} className={`px-3 py-1 rounded ${editorLang === 'ar' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>AR</button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                {activePage ? (
                    <Puck
                        key={`${activePageId}-${editorLang}`}
                        config={puckRenderConfig as any}
                        data={puckData}
                        onPublish={handlePublish}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">Select or create a page to begin</div>
                )}
            </div>

            {showNewPageDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">New CMS Page</h3>
                        <form onSubmit={e => {
                            e.preventDefault()
                            const fd = new FormData(e.currentTarget)
                            handleCreatePage(fd.get('name') as string, fd.get('slug') as string, fd.get('icon') as string)
                        }} className="space-y-4">
                            <input name="name" placeholder="Page Name" required className="w-full p-3 rounded-xl border" />
                            <input name="slug" placeholder="slug" required className="w-full p-3 rounded-xl border" />
                            <input name="icon" placeholder="Material Icon Name" required className="w-full p-3 rounded-xl border" />
                            <div className="flex gap-2">
                                <button type="submit" disabled={dialogLoading} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">Create</button>
                                <button type="button" onClick={() => setShowNewPageDialog(false)} className="px-6 py-3 bg-slate-100 rounded-xl">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl text-white font-bold shadow-xl ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}
