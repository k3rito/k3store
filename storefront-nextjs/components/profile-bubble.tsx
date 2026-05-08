import React from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'

interface ProfileBubbleProps {
  userName: string
  userEmail: string
  userRole: string
  isOpen: boolean
  onClose: () => void
}

export function ProfileBubble({ userName, userEmail, userRole, isOpen, onClose }: ProfileBubbleProps) {
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const supabase = createClient()

  if (!isOpen) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    onClose()
  }

  return (
    <div className="w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="bg-primary/5 p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
            {userName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white truncate">{userName}</h4>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {userRole}
        </div>
      </div>

      {/* Actions */}
      <div className="p-2">
        <button 
           onClick={() => { router.push(`/${locale}/contact`); onClose(); }}
           className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200 group"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">support_agent</span>
            <span className="font-medium">Support Center</span>
          </div>
          <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
        </button>

        <div className="mt-2 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-medium group"
          >
            <span className="material-symbols-outlined text-red-400 group-hover:text-red-600 transition-colors">logout</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
          MedStore Professional
        </p>
      </div>
    </div>
  )
}
