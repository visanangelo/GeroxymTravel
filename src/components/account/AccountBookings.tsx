import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { getSeatLabel } from '@/lib/bus-layout'
import { MapPin, Calendar, Ticket, ArrowRight, Clock } from 'lucide-react'

type Props = {
  locale: string
  userId: string
}

export default async function AccountBookings({ locale, userId }: Props) {
  const supabase = await createClient()

  // Fetch user's orders with route and ticket details
  // RLS policy allows orders by user_id OR customer_id where customer.user_id matches
  const { data: orders, error } = await supabase
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
    .limit(10)

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-destructive">
            Error loading bookings: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              My Bookings
            </CardTitle>
            <CardDescription>
              Your recent bookings and ticket information
            </CardDescription>
          </div>
          {orders && orders.length > 0 && (
            <Link href={`/${locale}/account?tab=bookings`}>
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const route = order.routes
              const tickets = (order.tickets || []) as Array<{ seat_no: number }>
              const seatNumbers = tickets.map((t) => t.seat_no).sort((a, b) => a - b)
              const capacityTotal = route?.capacity_total

              return (
                <Card
                  key={order.id}
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Route Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h3 className="text-xl font-bold">
                              {route?.origin} → {route?.destination}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="h-4 w-4" />
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
                          variant={
                            order.status === 'paid'
                              ? 'default'
                              : order.status === 'created'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-sm font-semibold"
                        >
                          {order.status}
                        </Badge>
                      </div>

                      {/* Order Details */}
                      <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Order ID
                          </div>
                          <div className="font-mono text-sm">{order.id.substring(0, 8)}...</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Quantity
                          </div>
                          <div className="font-semibold">{order.quantity} ticket(s)</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Total Amount
                          </div>
                          <div className="font-bold text-lg">
                            {formatCurrency(order.amount_cents / 100, order.currency)}
                          </div>
                        </div>
                      </div>

                      {/* Seat Numbers */}
                      {seatNumbers.length > 0 && (
                        <div className="pt-4 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Seat Numbers
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {seatNumbers.map((seatNo) => (
                              <Badge
                                key={seatNo}
                                variant="outline"
                                className="font-semibold bg-primary/10 border-primary/20"
                              >
                                {getSeatLabel(seatNo, capacityTotal)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        {order.status === 'created' && (
                          <Link href={`/${locale}/checkout/${order.id}`} className="flex-1">
                            <Button className="w-full">
                              Complete Payment
                            </Button>
                          </Link>
                        )}
                        <Link href={`/${locale}/account?tab=bookings`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start booking your first trip to see your tickets here
            </p>
            <Link href={`/${locale}/routes`}>
              <Button>
                Browse Routes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

