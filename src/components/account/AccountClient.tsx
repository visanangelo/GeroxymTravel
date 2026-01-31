'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import AccountHeader from './AccountHeader'
import ProfileCard from './ProfileCard'
import AccountForm from './AccountForm'
import SecuritySection from './SecuritySection'
import BookingsPreview from './BookingsPreview'
import BookingsList from './BookingsList'

const BookingDetailSheet = dynamic(() => import('./BookingDetailSheet'), {
  loading: () => null,
})

export type AccountTab = 'overview' | 'bookings'

export type OrderWithDetails = {
  id: string
  status: string
  quantity: number
  amount_cents: number
  currency: string
  created_at: string
  routes: {
    id: string
    origin: string
    destination: string
    depart_at: string
    price_cents: number
    currency: string
  } | null
  tickets: Array<{ seat_no: number }>
}

type Props = {
  locale: string
  customerName: string
  customerEmail: string
  customerPhone: string
  memberSince?: string
  orders: OrderWithDetails[]
  initialTab?: string | null
  initialBookingId?: string | null
}

export default function AccountClient({
  locale,
  customerName,
  customerEmail,
  customerPhone,
  memberSince,
  orders,
  initialTab,
  initialBookingId,
}: Props) {
  const [tab, setTab] = useState<AccountTab>(
    (initialTab === 'bookings' ? 'bookings' : 'overview') as AccountTab
  )
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    initialBookingId ?? null
  )

  const selectedOrder = selectedBookingId
    ? orders.find((o) => o.id === selectedBookingId)
    : null

  return (
    <div className="min-h-screen bg-background">
      <AccountHeader locale={locale} currentTab={tab} onTabChange={setTab} />

      {/* Page title */}
      <div className="border-b">
        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {tab === 'overview'
              ? 'Manage your profile, bookings and preferences'
              : 'View all your bookings and ticket details'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {tab === 'overview' ? (
          <div className="space-y-8">
            <ProfileCard
              fullName={customerName}
              email={customerEmail}
              phone={customerPhone}
              memberSince={memberSince}
            />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <AccountForm
                  initialFullName={customerName}
                  initialEmail={customerEmail}
                  initialPhone={customerPhone}
                  locale={locale}
                />
                <SecuritySection locale={locale} />
              </div>
              <div>
                <BookingsPreview
                  bookings={orders.slice(0, 3)}
                  locale={locale}
                  onViewAll={() => setTab('bookings')}
                  onBookingClick={setSelectedBookingId}
                />
              </div>
            </div>
          </div>
        ) : (
          <BookingsList
            orders={orders}
            locale={locale}
            onBookingClick={setSelectedBookingId}
          />
        )}
      </div>

      <BookingDetailSheet
        order={selectedOrder}
        locale={locale}
        open={!!selectedOrder}
        onClose={() => setSelectedBookingId(null)}
      />
    </div>
  )
}
