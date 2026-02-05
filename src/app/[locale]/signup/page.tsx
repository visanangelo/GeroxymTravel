import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignupForm from '@/components/auth/SignupForm'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function SignupPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { email } = await searchParams

  const supabase = await createClient()

  // Check if user is already logged in and email confirmed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email_confirmed_at) {
    redirect(`/${locale}/account?tab=bookings`)
  }

  // User exists but email not confirmed – show verify message instead of form
  if (user && !user.email_confirmed_at) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="rounded-lg border bg-card p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Verify your email</h2>
            <p className="text-muted-foreground mb-4">
              We sent a confirmation link to your email. Please check your inbox (and spam folder), click the link, then sign in.
            </p>
            <a
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Sign in
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
          <p className="text-muted-foreground">
            Sign up to manage your bookings and access exclusive features
          </p>
        </div>
        <SignupForm locale={locale} prefillEmail={email || ''} />
      </div>
    </div>
  )
}

