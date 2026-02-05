import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; redirect?: string; confirm_email?: string }>
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { error: errorParam, redirect: redirectParam, confirm_email: confirmEmailParam } = await searchParams
  const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : undefined
  const confirmEmail = confirmEmailParam === '1' || confirmEmailParam === 'true'

  // Check if user is already logged in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only redirect if user has confirmed email
  if (user?.email_confirmed_at) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect(redirectTo ?? `/${locale}/account`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm locale={locale} initialError={errorParam} redirectTo={redirectTo} confirmEmailMessage={confirmEmail} />
      </div>
    </div>
  )
}

