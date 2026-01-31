import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['ro', 'en']

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ro',
  localePrefix: 'always',
})

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check if it's an admin route (with or without locale prefix)
  const isAdminRouteWithLocale = /^\/[a-z]{2}\/admin/.test(pathname) // e.g., /ro/admin
  const isAdminRouteDirect = pathname.startsWith('/admin') // e.g., /admin
  
  // Redirect old locale-based admin routes to new optimized routes
  if (isAdminRouteWithLocale) {
    const locale = pathname.split('/')[1]
    const adminPath = pathname.replace(`/${locale}/admin`, '/admin')
    // Preserve query params
    const url = new URL(adminPath, request.url)
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
    return NextResponse.redirect(url)
  }
  
  // Check if it's an admin route (without locale prefix)
  const isAdminRoute = isAdminRouteDirect
  
  if (!isAdminRoute) {
    // Public route - apply i18n middleware
    return intlMiddleware(request)
  }

  // Admin route - check authentication (no locale processing needed)
  // Admin routes use default locale 'ro' for redirects
  const locale = 'ro'

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Create Supabase client only for admin routes
    let supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // If no user, redirect to login page
    if (!user || authError) {
      const loginUrl = new URL(`/${locale}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      const homeUrl = new URL(`/${locale}`, request.url)
      return NextResponse.redirect(homeUrl)
    }

    // User is authenticated and is admin
    // For admin routes, don't use intlMiddleware (it would add locale prefix)
    // Just return the response with cookies
    return supabaseResponse
  } catch (error) {
    // If there's an error with Supabase, redirect to login
    console.error('Proxy error:', error)
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - static files (images, etc.)
  matcher: ['/((?!api|_next|.*\\..*|favicon.ico).*)'],
}

