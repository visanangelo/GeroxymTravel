import { createClient } from '@/lib/supabase/server'
import SiteLayoutWithHeader from '@/components/layout/SiteLayoutWithHeader'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let role: 'admin' | 'user' | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = profile?.role === 'admin' ? 'admin' : 'user'
  }
  const initialAuth = { isLoggedIn: !!user, role }

  return (
    <SiteLayoutWithHeader locale={locale} initialAuth={initialAuth}>
      {children}
    </SiteLayoutWithHeader>
  )
}