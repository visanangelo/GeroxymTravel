import dynamicImport from 'next/dynamic'
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
import { formatCurrency } from '@/lib/utils'
import { getSeatLabel } from '@/lib/bus-layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Database } from '@/lib/supabase/database.types'
import { ArrowLeft, MapPin, Calendar, DollarSign, Users } from 'lucide-react'

const SeatMap = dynamicImport(() => import('@/components/admin/SeatMap'), {
  loading: () => (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-muted/30">
      <span className="text-sm text-muted-foreground">Se încarcă harta locurilor...</span>
    </div>
  ),
})

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

// Default locale for admin (no locale in URL)
const DEFAULT_LOCALE = 'ro'

export default async function RouteDetailsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch route
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('id', id)
    .single()

  if (routeError || !route) {
    notFound()
  }

  // Fetch seats for this route
  const { data: seats, error: seatsError } = await supabase
    .from('route_seats')
    .select('seat_no, pool')
    .eq('route_id', id)
    .order('seat_no', { ascending: true })

  // Get assigned seats (tickets) with order info
  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      seat_no,
      order_id,
      status,
      orders (
        id,
        quantity,
        source,
        metadata,
        created_at
      )
    `)
    .eq('route_id', id)
    .eq('status', 'paid')
    .order('seat_no', { ascending: true })

  const assignedSeatNos = new Set(tickets?.map((t) => t.seat_no) || [])

  // Prepare seat data for SeatMap
  const seatData =
    seats?.map((seat) => ({
      seat_no: seat.seat_no,
      pool: seat.pool,
      assigned: assignedSeatNos.has(seat.seat_no),
    })) || []

  // Calculate statistics
  const onlineSeats = seats?.filter((s) => s.pool === 'online') || []
  const offlineSeats = seats?.filter((s) => s.pool === 'offline') || []
  const onlineAssigned = onlineSeats.filter((s) =>
    assignedSeatNos.has(s.seat_no)
  ).length
  const onlineRemaining = onlineSeats.length - onlineAssigned
  const offlineAssigned = offlineSeats.filter((s) =>
    assignedSeatNos.has(s.seat_no)
  ).length

  const routeWithMeta = route as Database['public']['Tables']['routes']['Row'] & { image_url?: string | null; description?: string | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/admin/routes">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              {route.origin} → {route.destination}
            </h1>
          </div>
          <p className="text-muted-foreground ml-11">Route Details & Analytics</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/routes/${route.id}/edit`}>
            <Button variant="outline">Edit Route</Button>
          </Link>
        </div>
      </div>

      {routeWithMeta.image_url && (
        <div className="rounded-lg overflow-hidden border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={routeWithMeta.image_url}
            alt={`${route.origin} → ${route.destination}`}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Route Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Origin
              </div>
              <div className="text-lg font-semibold">{route.origin}</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Destination
              </div>
              <div className="text-lg font-semibold">{route.destination}</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Departure
              </div>
              <div className="text-lg font-semibold">
                {new Date(route.depart_at).toLocaleString(DEFAULT_LOCALE, {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div>
                <Badge
                  variant={route.status === 'active' ? 'default' : route.status === 'cancelled' ? 'destructive' : 'secondary'}
                  className={
                    route.status === 'active'
                      ? 'bg-green-500 hover:bg-green-600'
                      : route.status === 'cancelled'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  }
                >
                  {route.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price
              </div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(route.price_cents / 100, route.currency)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Seat Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-muted-foreground">
                Total Capacity
              </div>
              <div className="text-2xl font-bold">
                {route.capacity_total}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Online Total
                </div>
                <div className="text-xl font-bold text-green-600">
                  {onlineSeats.length}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Online Assigned
                </div>
                <div className="text-xl font-bold">
                  {onlineAssigned}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Online Remaining
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {onlineRemaining}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Offline Reserve
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {offlineSeats.length}
                </div>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">
                Offline Seats Assigned
              </div>
              <div className="text-lg font-semibold">{offlineAssigned}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {routeWithMeta.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: routeWithMeta.description }}
            />
          </CardContent>
        </Card>
      )}

      {/* Seat Map */}
      <Card>
        <CardHeader>
          <CardTitle>Seat Map</CardTitle>
          <CardDescription>
            Visual representation of all seats. Green = Available (Online),
            Orange = Offline Reserve, Gray = Occupied
          </CardDescription>
        </CardHeader>
        <CardContent>
          {seatsError ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              Error loading seats: {seatsError.message}
            </div>
          ) : seatData.length > 0 ? (
            <SeatMap seats={seatData} totalCapacity={route.capacity_total} />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No seats found for this route
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets List */}
      {tickets && tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tickets ({tickets.length})</CardTitle>
            <CardDescription>
              All assigned tickets for this route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Seat #</TableHead>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Source</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket: any) => {
                    const order = ticket.orders
                    const metadata = order?.metadata as
                      | { customer_name?: string; phone?: string }
                      | null
                    const customerName =
                      metadata?.customer_name ||
                      order?.id?.substring(0, 8) ||
                      'N/A'

                    return (
                      <TableRow key={`${ticket.order_id}-${ticket.seat_no}`} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-semibold">
                            {getSeatLabel(ticket.seat_no, route.capacity_total)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {ticket.order_id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{customerName}</div>
                          {metadata?.phone && (
                            <div className="text-xs text-muted-foreground">
                              {metadata.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={order?.source === 'online' ? 'default' : 'secondary'}
                            className={
                              order?.source === 'online'
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-purple-500 hover:bg-purple-600'
                            }
                          >
                            {order?.source || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ticket.status === 'paid' ? 'default' : 'secondary'}
                            className={
                              ticket.status === 'paid'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-500 hover:bg-gray-600'
                            }
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order?.created_at
                            ? new Date(order.created_at).toLocaleString(
                                DEFAULT_LOCALE,
                                {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                }
                              )
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

