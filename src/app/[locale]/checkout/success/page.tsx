import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { CheckoutSuccessProcessing } from '@/components/checkout/CheckoutSuccessProcessing'
import { CheckCircle2, Mail, UserPlus, MapPin, Calendar, Ticket } from 'lucide-react'
import CreateAccountCTA from '@/components/checkout/CreateAccountCTA'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ orderId?: string }>
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { orderId } = await searchParams

  if (!orderId) {
    redirect(`/${locale}/routes`)
  }

  const supabase = await createClient()
  
  // Use service client to read order (bypasses RLS for guest orders)
  const serviceClient = createServiceClient()

  // Fetch order with route and customer (without nested tickets to avoid RLS issues)
  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select(`
      *,
      routes (
        id,
        origin,
        destination,
        depart_at,
        price_cents,
        currency
      ),
      customers (
        id,
        full_name,
        email,
        phone,
        user_id
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    notFound()
  }

  // If still 'created', webhook may be delayed – show processing state and refresh
  if (order.status === 'created') {
    return <CheckoutSuccessProcessing locale={locale} />
  }

  if (order.status !== 'paid') {
    redirect(`/${locale}/checkout/confirm?orderId=${orderId}`)
  }

  // Fetch tickets separately using service client (bypasses RLS)
  const { data: ticketsData } = await serviceClient
    .from('tickets')
    .select('seat_no')
    .eq('order_id', orderId)
    .eq('status', 'paid')

  const route = order.routes as any
  const customer = order.customers as any
  const tickets = ticketsData || []
  const seatNumbers = tickets.map((t) => t.seat_no).sort((a, b) => a - b)

  // Check if customer already has an account
  const hasAccount = customer.user_id !== null

  // Check if current user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500 p-2">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
                  <CardDescription>
                    Your tickets have been successfully booked
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Your tickets have been sent to:</span>
                </div>
                <div className="font-semibold">{customer.email}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Route Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Route</div>
                  <div className="text-lg font-semibold">
                    {route.origin} → {route.destination}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(route.depart_at).toLocaleString(locale, {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(order.amount_cents / 100, order.currency)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seat Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Your Seats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Allocated Seat Numbers ({seatNumbers.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seatNumbers.map((seatNo) => (
                      <div
                        key={seatNo}
                        className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg font-semibold text-primary"
                      >
                        Seat {seatNo}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Order ID</div>
                  <div className="font-mono text-xs bg-muted p-2 rounded">
                    {orderId}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{customer.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{customer.email}</div>
              </div>
              {customer.phone && (
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{customer.phone}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optional Account Creation */}
          {!hasAccount && !isLoggedIn && (
            <CreateAccountCTA locale={locale} customerEmail={customer.email} />
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href={`/${locale}/routes`} className="flex-1">
              <Button variant="outline" className="w-full">
                Book Another Route
              </Button>
            </Link>
            {isLoggedIn && (
              <Link href={`/${locale}/account?tab=bookings`} className="flex-1">
                <Button className="w-full">View My Bookings</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
