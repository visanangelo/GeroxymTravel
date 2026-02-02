'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { getSeatLabel } from '@/lib/bus-layout'
import { ArrowRight, MapPin, Calendar, Ticket } from 'lucide-react'
import type { OrderWithDetails } from './AccountClient'

type Props = {
  bookings: OrderWithDetails[]
  locale: string
  onViewAll: () => void
  onBookingClick: (id: string) => void
}

const previewSize = 3

function getStatusVariant(status: string) {
  switch (status) {
    case 'paid':
      return 'default'
    case 'created':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
    case 'created':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
    case 'cancelled':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
    default:
      return ''
  }
}

export default function BookingsPreview({ bookings, locale, onViewAll, onBookingClick }: Props) {
  const previewBookings = bookings.slice(0, previewSize)
  const hasMore = bookings.length > previewSize

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
            <CardDescription className="text-sm">
              Your latest bookings and ticket information
            </CardDescription>
          </div>
          {hasMore && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="w-fit shrink-0">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {previewBookings.length > 0 ? (
          <div className="space-y-3">
            {previewBookings.map((booking) => {
              const route = booking.routes
              const tickets = booking.tickets || []
              const seatNumbers = tickets.map((t) => t.seat_no).sort((a, b) => a - b)

              return (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => onBookingClick(booking.id)}
                  className="flex w-full flex-col gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {route?.origin} → {route?.destination}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>
                            {route?.depart_at
                              ? new Date(route.depart_at).toLocaleDateString(locale, {
                                  dateStyle: 'medium',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {seatNumbers.length > 0 && (
                      <div className="flex items-center gap-1.5 ml-6 text-xs text-muted-foreground">
                        <Ticket className="h-3 w-3 shrink-0" />
                        Locuri: {seatNumbers.map((n) => getSeatLabel(n)).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                    <span className="font-semibold text-sm">
                      {formatCurrency(booking.amount_cents / 100, booking.currency)}
                    </span>
                    <Badge
                      variant={getStatusVariant(booking.status)}
                      className={getStatusColor(booking.status) + ' shrink-0'}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Ticket className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No bookings yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/routes`}>
                Browse Routes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
