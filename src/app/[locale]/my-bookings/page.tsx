import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
}

/** Redirect to unified account page (bookings tab). No duplicate page. */
export default async function MyBookingsPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/account?tab=bookings`)
  }

  redirect(`/${locale}/account?tab=bookings`)
}
