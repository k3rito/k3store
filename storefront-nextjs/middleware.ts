import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // First run the i18n middleware to attach locale logic
  const i18nResponse = handleI18nRouting(request)
  
  // Then pass the i18n response to our Supabase Auth middleware
  // so it can wrap around it and persist session cookies together
  return await updateSession(request, i18nResponse)
}

export const config = {
  matcher: [
    // Next-intl expects to match all routes, except specific statically generated paths
    '/',
    '/(ar|en)/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
