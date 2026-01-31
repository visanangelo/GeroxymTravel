import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import CheckoutConfirmForm from '@/components/checkout/CheckoutConfirmForm'
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ orderId?: string }>
}

export default async function CheckoutConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { orderId } = await searchParams

  if (!orderId) {
    redirect(`/${locale}/routes`)
  }

  const supabase = await createClient()
  
  // Use service client to read order (bypasses RLS for guest orders)
  const serviceClient = createServiceClient()

  // Fetch order with route and customer details
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
        currency,
        capacity_online
      ),
      customers (
        id,
        full_name,
        email,
        phone
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    notFound()
  }

  // Only allow checkout for 'created' orders
  if (order.status !== 'created') {
    if (order.status === 'paid') {
      redirect(`/${locale}/checkout/success?orderId=${orderId}`)
    }
    throw new Error(`Cannot checkout order with status: ${order.status}`)
  }

  const route = order.routes as any
  const customer = order.customers as any

  // Check availability one more time
  // Use service client to read tickets (bypasses RLS for guest access)
  const { data: tickets } = await serviceClient
    .from('tickets')
    .select('seat_no')
    .eq('route_id', route.id)
    .eq('status', 'paid')

  const assignedSeatNos = new Set(tickets?.map((t: { seat_no: number }) => t.seat_no) || [])
  const onlineSold = Array.from(assignedSeatNos).filter(
    (seatNo) => seatNo <= route.capacity_online
  ).length
  const onlineRemaining = route.capacity_online - onlineSold

  if (order.quantity > onlineRemaining) {
    throw new Error(
      `Only ${onlineRemaining} seats available. Please select fewer tickets.`
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Confirm Your Booking</h1>
            <p className="text-muted-foreground">Review your order details before confirming</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Route</div>
                  <div className="text-xl font-semibold">
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
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
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
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{customer.phone}</div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <span className="font-semibold">{order.quantity} ticket(s)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price per ticket</span>
                  <span className="font-semibold">
                    {formatCurrency(route.price_cents / 100, route.currency)}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(order.amount_cents / 100, order.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Ready to Pay?</CardTitle>
              <CardDescription>
                Click the button below to pay securely with your card. You will be redirected to Stripe Checkout.
                Seats will be assigned after payment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutConfirmForm locale={locale} orderId={orderId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

