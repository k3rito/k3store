import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return
  }

  const i18nResponse = handleI18nRouting(request)
  return await updateSession(request, i18nResponse)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
