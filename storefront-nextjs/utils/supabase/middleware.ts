import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, i18nResponse?: NextResponse) {
  let supabaseResponse = i18nResponse || NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          supabaseResponse = i18nResponse ? i18nResponse : NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = /^\/([^\/]+\/)?login\/?/.test(pathname);
  const isAdminRoute = /^\/([^\/]+\/)?admin\/?/.test(pathname);

  // Helper for locale-aware redirects
  const getRedirectUrl = (path: string) => {
    const url = request.nextUrl.clone()
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    url.pathname = `${localePrefix}${path}`
    return url
  }

  // 1. Unauthenticated & Admin -> Login
  if (!user && isAdminRoute) {
    return NextResponse.redirect(getRedirectUrl('/login'))
  }

  // 2. Authenticated checks
  if (user) {
    // Prioritize JWT metadata for role (Authoritative source)
    const userRole = user.app_metadata?.role
    const adminRoles = ['super_admin', 'supervisor', 'employee', 'editor']
    const isAdmin = adminRoles.includes(userRole)

    // Admin Route -> Check Role
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(getRedirectUrl(''))
    }

    // Auth Route (Login) -> Redirect to appropriate dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(isAdmin ? getRedirectUrl('/admin') : getRedirectUrl(''))
    }
  }

  return supabaseResponse
}
