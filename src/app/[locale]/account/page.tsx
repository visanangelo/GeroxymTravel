import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import AccountClient from '@/components/account/AccountClient'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tab?: string; booking?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = locale === 'ro' ? 'ro' : 'en'
  const titles = {
    ro: 'Contul meu | Geroxym Travel',
    en: 'My account | Geroxym Travel',
  }
  const descriptions = {
    ro: 'Gestionează profilul și rezervările tale. Geroxym Travel.',
    en: 'Manage your profile and bookings. Geroxym Travel.',
  }
  return {
    title: titles[t],
    description: descriptions[t],
    robots: 'noindex', // account is private
    openGraph: {
      title: titles[t],
      description: descriptions[t],
      locale: locale === 'ro' ? 'ro_RO' : 'en_US',
    },
  }
}

export default async function AccountPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { tab: tabParam, booking: bookingParam } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/account`)
  }

  // Require confirmed email – friendly redirect so they see "verify inbox" + resend on login
  if (!user.email_confirmed_at) {
    redirect(`/${locale}/login?confirm_email=1&redirect=/${locale}/account`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect(`/${locale}/admin`)
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('full_name, email, phone, created_at')
    .eq('user_id', user.id)
    .single()

  // Single fetch: all orders for overview + bookings list (no duplicate requests)
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      routes (
        id,
        origin,
        destination,
        depart_at,
        price_cents,
        currency,
        capacity_total
      ),
      tickets (
        seat_no
      )
    `)
    .order('created_at', { ascending: false })

  const customerName = customer?.full_name || user.email?.split('@')[0] || 'User'
  const customerEmail = customer?.email || user.email || ''
  const customerPhone = customer?.phone || 'Not provided'
  const memberSince = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      })
    : undefined

  return (
    <Suspense fallback={<AccountPageSkeleton />}>
      <AccountClient
        locale={locale}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        memberSince={memberSince}
        orders={(orders || []) as import('@/components/account/AccountClient').OrderWithDetails[]}
        initialTab={tabParam ?? null}
        initialBookingId={bookingParam ?? null}
      />
    </Suspense>
  )
}

function AccountPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 h-14 border-b bg-background" />
      <div className="border-b">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
