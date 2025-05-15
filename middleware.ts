import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  try {
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not authenticated and trying to access protected routes
    if (!session && isProtectedRoute(request.nextUrl.pathname)) {
      const redirectUrl = new URL('/login', request.url)
      // Add the original URL as a search parameter to redirect after login
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated, check subscription status for premium routes
    if (session && isPremiumRoute(request.nextUrl.pathname)) {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('status, cancel_at_period_end')
        .eq('user_id', session.user.id)
        .single()
      
      if (error) {
        console.error('Subscription check error:', error)
        // Continue but don't block user in case of DB error
        return res
      }

      const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
      const isCanceled = subscription?.cancel_at_period_end

      if (!isActive || isCanceled) {
        return NextResponse.redirect(new URL('/pricing', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Always return a response, even in case of errors
    return res
  }
}

// Define protected routes that require authentication
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/account',
    '/dashboard',
    '/gigs/create',
    '/gigs/manage',
    '/applications',
    '/messages',
    '/portfolio',
    '/payments',
    '/saved',
    '/settings',
  ]
  return protectedRoutes.some(route => pathname.startsWith(route))
}

// Define premium routes that require an active subscription
function isPremiumRoute(pathname: string): boolean {
  const premiumRoutes = [
    '/gigs/create',
    '/gigs/manage',
    '/analytics',
    '/premium-features',
  ]
  return premiumRoutes.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (for webhooks and other backend functionality)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
} 