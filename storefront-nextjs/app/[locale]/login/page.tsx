'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/components/providers'

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const tNav = useTranslations('Navigation')
  const tLogin = useTranslations('Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { setIsLoading } = useLoading()
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    setIsLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      setIsLoading(false)
      return
    }

    // Check role for redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (['super_admin', 'supervisor', 'employee', 'editor'].includes(profile?.role)) {
        router.push(`/${locale}/admin`)
      } else {
        router.push(`/${locale}`)
      }
      router.refresh()
      setIsLoading(false)
    }
  }

  async function handleSignup(e: React.MouseEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signupError } = await supabase.auth.signUp({ email, password })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    setError(null)
    // After signup, auto-login
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError('Account created! Please check your email to confirm, then log in.')
      setLoading(false)
      return
    }

    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background-light dark:bg-background-dark px-4 py-12 relative overflow-hidden">
      {/* Background decoration matching the MedStore design system */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary/5 -skew-y-3 origin-top-left -z-10"></div>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 relative z-10">
        
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <div className="bg-primary p-2.5 rounded-xl text-white mb-4 shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-3xl block">medical_services</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{tLogin('welcome')}</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">{tLogin('subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
              {tLogin('email')}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
              {tLogin('password')}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              {loading ? tLogin('signingIn') : tLogin('signIn')}
            </button>
            <button 
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              {tLogin('createAccount')}
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          <p>{tLogin('secureLogin')}</p>
          <a href={`/${locale}`} className="text-primary hover:underline mt-2 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">arrow_back</span>
            {tLogin('returnToStore')}
          </a>
        </div>
      </div>
    </div>
  )
}
