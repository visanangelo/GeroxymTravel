import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback: Supabase redirects here after Google/Facebook sign-in.
 * Exchange code for session, then redirect to `next` or home.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
  }

  const origin = new URL(request.url).origin
  const safeNext = next.startsWith('/') ? next : `/${next}`
  return NextResponse.redirect(`${origin}${safeNext}`)
}
