import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Localized OAuth callback: /{locale}/auth/callback
 * Handles code exchange and redirects to `next` or /{locale}/account.
 */
export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const { locale } = params
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? `/${locale}/account`

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth`, request.url))
  }

  const origin = new URL(request.url).origin
  const safeNext = next.startsWith('/') ? next : `/${next}`
  return NextResponse.redirect(`${origin}${safeNext}`)
}
