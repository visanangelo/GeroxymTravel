import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string; orderId: string }>
}

/** Redirect to unified account page with booking detail sheet open. No duplicate page. */
export default async function BookingDetailRedirectPage({ params }: Props) {
  const { locale, orderId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/account?booking=${orderId}`)
  }

  redirect(`/${locale}/account?booking=${orderId}`)
}
