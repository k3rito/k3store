import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, i18nResponse?: NextResponse) {
  let supabaseResponse = i18nResponse || NextResponse.next({
    request,
  })

  // To properly ensure the headers and cookies from i18nResponse act as a base, we use it directly:
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
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
  
  // Use regex to catch locales like /en/admin or /ar/login, as well as just /admin
  const isAuthRoute = /^\/([^\/]+\/)?login\/?/.test(pathname);
  const isAdminRoute = /^\/([^\/]+\/)?admin\/?/.test(pathname);

  // If unauthenticated and trying to access admin, redirect to login
  if (!user && isAdminRoute) {
    const url = request.nextUrl.clone()
    // Maintain the locale prefix if it exists
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    url.pathname = `${localePrefix}/login`
    return NextResponse.redirect(url)
  }

  // If authenticated and accessing admin, check role
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const adminRoles = ['super_admin', 'supervisor', 'employee', 'editor']
    if (!profile || !adminRoles.includes(profile.role)) {
      const url = request.nextUrl.clone()
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
      url.pathname = localePrefix || '/'
      return NextResponse.redirect(url)
    }
  }

  // If authenticated and trying to access login, redirect to admin if admin, else home
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const url = request.nextUrl.clone()
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    const adminRoles = ['super_admin', 'supervisor', 'employee', 'editor']
    url.pathname = adminRoles.includes(profile?.role) ? `${localePrefix}/admin` : (localePrefix || '/')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
