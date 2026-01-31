import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import CheckoutForm from '@/components/checkout/CheckoutForm'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string; orderId: string }>
}

export default async function CheckoutPage({ params }: Props) {
  const { locale, orderId } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/checkout/${orderId}`)
  }

  // Fetch order with route details
  const { data: order, error: orderError } = await supabase
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
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    notFound()
  }

  // Verify order belongs to current user
  if (order.user_id !== user.id) {
    notFound()
  }

  // If already paid, redirect to success
  if (order.status === 'paid') {
    redirect(`/${locale}/checkout/success?orderId=${orderId}`)
  }

  // Only allow checkout for 'created' orders
  if (order.status !== 'created') {
    throw new Error(`Cannot checkout order with status: ${order.status}`)
  }

  const route = order.routes as any

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Review your order and complete payment</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Route</div>
              <div className="text-lg font-semibold">
                {route.origin} → {route.destination}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(route.depart_at).toLocaleString('ro-RO', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Quantity</div>
              <div className="text-lg font-semibold">{order.quantity} ticket(s)</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Price per ticket</div>
              <div className="text-lg font-semibold">
                {formatCurrency(route.price_cents / 100, route.currency)}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Total Amount</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(order.amount_cents / 100, order.currency)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Complete payment securely with your card via Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutForm locale={locale} orderId={orderId} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


