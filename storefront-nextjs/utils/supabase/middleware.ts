import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, i18nResponse?: NextResponse) {
  let supabaseResponse = i18nResponse ?? NextResponse.next({
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
          supabaseResponse = NextResponse.next({
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

  const getRedirectUrl = (path: string) => {
    const url = request.nextUrl.clone()
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    url.pathname = `${localePrefix}${path}`
    return url
  }

  // Exact path matching to prevent loops
  const isLoginPage = pathname.endsWith('/login')
  const isRegisterPage = pathname.endsWith('/register')
  const isAdminPath = pathname.includes('/admin')

  if (!user && isAdminPath) {
    return NextResponse.redirect(getRedirectUrl('/login'))
  }

  if (user) {
    const userRole = user.app_metadata?.role
    const adminRoles = ['super_admin', 'supervisor', 'employee', 'editor']
    const isAdmin = adminRoles.includes(userRole)

    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(getRedirectUrl(''))
    }

    if (isLoginPage || isRegisterPage) {
      return NextResponse.redirect(isAdmin ? getRedirectUrl('/admin') : getRedirectUrl(''))
    }
  }

  return supabaseResponse
}
