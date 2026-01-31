import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Hash,
  Mail,
  Phone,
} from 'lucide-react'
import { Database } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  routes?: Database['public']['Tables']['routes']['Row']
  orders?: Database['public']['Tables']['orders']['Row'] & {
    profiles?: Database['public']['Tables']['profiles']['Row'] | null
  }
}

type Props = {
  params: Promise<{ id: string }>
}

// Default locale for admin (no locale in URL)
const DEFAULT_LOCALE = 'ro'

export default async function TicketDetailsPage({ params }: Props) {
  const { id } = await params
  // Use normal client - RLS policies allow admins to view all tickets
  const supabase = await createClient()

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(
      `
      *,
      routes (
        id,
        origin,
        destination,
        depart_at,
        price_cents,
        currency,
        status,
        capacity_total,
        capacity_online
      ),
      orders (
        id,
        quantity,
        amount_cents,
        currency,
        status,
        source,
        metadata,
        created_at,
        user_id
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching ticket:', error)
    notFound()
  }

  if (!ticket) {
    console.error('Ticket not found:', id)
    notFound()
  }

  // Type assertion for the joined data
  const ticketWithRelations = ticket as Ticket
  const route = ticketWithRelations.routes as Database['public']['Tables']['routes']['Row'] | null
  const order = ticketWithRelations.orders as Database['public']['Tables']['orders']['Row'] | null

  const metadata = (order?.metadata as { customer_name?: string; phone?: string }) || null

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/admin/tickets">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Details</h1>
          </div>
          <p className="text-muted-foreground">View comprehensive ticket information</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/routes/${route?.id}`}>
            <Button variant="outline">View Route</Button>
          </Link>
          <Link href={`/admin/orders?orderId=${order?.id}`}>
            <Button variant="outline">View Order</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ticket Information */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
            <CardDescription>Primary ticket details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-sm">Ticket ID</span>
              </div>
              <span className="font-mono text-sm font-medium">{ticketWithRelations.id.substring(0, 8)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-sm">Seat Number</span>
              </div>
              <Badge variant="outline" className="font-semibold text-base px-3 py-1">
                Seat {ticketWithRelations.seat_no}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={ticketWithRelations.status === 'paid' ? 'default' : 'secondary'}
                className={
                  ticketWithRelations.status === 'paid'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-500 hover:bg-gray-600'
                }
              >
                {ticketWithRelations.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Created At</span>
              <span className="text-sm font-medium">
                {new Date(ticketWithRelations.created_at).toLocaleString(DEFAULT_LOCALE, {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Route Information */}
        {route && (
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
              <CardDescription>Journey details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 py-2 border-b">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">Route</div>
                  <div className="font-semibold text-base">
                    {route.origin} → {route.destination}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-2 border-b">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground">Departure</div>
                  <div className="font-medium">
                    {new Date(route.depart_at).toLocaleString(DEFAULT_LOCALE, {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Price per Ticket</span>
                <span className="font-semibold">
                  {formatCurrency(route.price_cents / 100, route.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Route Status</span>
                <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                  {route.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Information */}
        {order && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Booking and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="font-mono text-sm font-medium">{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <span className="font-semibold">{order.quantity} ticket(s)</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(order.amount_cents / 100, order.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <Badge
                      variant={order.source === 'online' ? 'default' : 'secondary'}
                      className={
                        order.source === 'online'
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }
                    >
                      {order.source}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Order Status</span>
                    <Badge
                      variant={
                        order.status === 'paid' || order.status === 'paid_offline'
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        order.status === 'paid' || order.status === 'paid_offline'
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Created At</span>
                    <span className="text-sm font-medium">
                      {new Date(order.created_at).toLocaleString(DEFAULT_LOCALE, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  {order.user_id && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">User ID</span>
                      <span className="font-mono text-xs">{order.user_id.substring(0, 8)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              {(metadata?.customer_name || metadata?.phone) && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      {metadata.customer_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{metadata.customer_name}</span>
                        </div>
                      )}
                      {metadata.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{metadata.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

