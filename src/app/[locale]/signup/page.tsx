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

  // Check if user is already logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(`/${locale}/account?tab=bookings`)
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

