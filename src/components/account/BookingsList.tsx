'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { getSeatLabel } from '@/lib/bus-layout'
import { MapPin, Calendar, Ticket, ArrowRight } from 'lucide-react'
import type { OrderWithDetails } from './AccountClient'

type Props = {
  orders: OrderWithDetails[]
  locale: string
  onBookingClick: (id: string) => void
}

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

export default function BookingsList({ orders, locale, onBookingClick }: Props) {
  if (orders.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12 sm:py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Ticket className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Start booking your first trip to see your tickets here
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href={`/${locale}/routes`}>
                  Browse Routes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const route = order.routes
        const tickets = (order.tickets || []) as Array<{ seat_no: number }>
        const seatNumbers = tickets.map((t) => t.seat_no).sort((a, b) => a - b)

        return (
          <Card
            key={order.id}
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onBookingClick(order.id)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {route?.origin} → {route?.destination}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mt-1 ml-6 sm:ml-7">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {route?.depart_at
                          ? new Date(route.depart_at).toLocaleString(locale, {
                              dateStyle: 'long',
                              timeStyle: 'short',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(order.status)}
                    className={getStatusColor(order.status) + ' shrink-0'}
                  >
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-semibold">
                      {formatCurrency(order.amount_cents / 100, order.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Tickets</div>
                    <div>
                      {order.quantity} ticket{order.quantity > 1 ? 's' : ''}
                    </div>
                  </div>
                  {seatNumbers.length > 0 && (
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> Locuri
                      </div>
                      <div className="text-sm">
                        {seatNumbers.map((n) => getSeatLabel(n, (order.routes as { capacity_total?: number })?.capacity_total)).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => onBookingClick(order.id)}>
                    View details
                  </Button>
                  {order.status === 'created' && (
                    <Button size="sm" asChild>
                      <Link href={`/${locale}/checkout/${order.id}`}>
                        Complete Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
