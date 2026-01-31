import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import TicketActionsCell from '@/components/admin/TicketActionsCell'
import { Database } from '@/lib/supabase/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  routes?: Database['public']['Tables']['routes']['Row']
  orders?: Database['public']['Tables']['orders']['Row']
}

const ITEMS_PER_PAGE = 20

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ route_id?: string; page?: string }>
}

// Default locale for admin (no locale in URL)
const DEFAULT_LOCALE = 'ro'

// Cache tickets query for instant navigation
const getTickets = cache(async (routeId: string | undefined, from: number, to: number) => {
  const supabase = await createClient()
  let query = supabase
    .from('tickets')
    .select(
      `
      id,
      seat_no,
      status,
      route_id,
      order_id,
      routes (
        origin,
        destination,
        depart_at
      ),
      orders (
        id,
        source,
        metadata,
        created_at
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'paid')
    .order('seat_no', { ascending: true })
    .range(from, to)

  if (routeId) {
    query = query.eq('route_id', routeId)
  }

  return query
})

// Revalidate every 30 seconds for fresh data
export const revalidate = 30

export default async function TicketsListPage({ params, searchParams }: Props) {
  await params // Admin routes don't have params, but we await for consistency
  const { route_id, page = '1' } = await searchParams

  // Calculate pagination
  const pageNum = parseInt(page) || 1
  const from = (pageNum - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  // Fetch tickets (cached for instant navigation)
  const { data: tickets, error, count } = await getTickets(route_id, from, to)

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Error loading tickets: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            View all assigned tickets
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tickets ({count || 0})</CardTitle>
            {count && count > ITEMS_PER_PAGE && (
              <div className="flex gap-2">
                {pageNum > 1 && (
                  <Link
                    href={`/admin/tickets?${route_id ? `route_id=${route_id}&` : ''}page=${pageNum - 1}`}
                  >
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                {pageNum * ITEMS_PER_PAGE < count && (
                  <Link
                    href={`/admin/tickets?${route_id ? `route_id=${route_id}&` : ''}page=${pageNum + 1}`}
                  >
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
          {count && count > ITEMS_PER_PAGE && (
            <p className="text-sm text-muted-foreground mt-2">
              Page {pageNum} of {Math.ceil(count / ITEMS_PER_PAGE)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {tickets && tickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seat #</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tickets as Ticket[]).map((ticket) => {
                  const route = ticket.routes
                  const order = ticket.orders
                  const metadata = order?.metadata as
                    | { customer_name?: string; phone?: string }
                    | null
                  const customerName =
                    metadata?.customer_name ||
                    order?.id?.substring(0, 8) ||
                    'N/A'

                  return (
                    <TableRow key={ticket.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="hover:underline"
                        >
                          <Badge variant="outline" className="font-semibold cursor-pointer hover:bg-accent">
                            {ticket.seat_no}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {route ? (
                          <div>
                            <div className="font-medium">
                              {route.origin} → {route.destination}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(route.depart_at).toLocaleString(
                                DEFAULT_LOCALE,
                                {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                }
                              )}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customerName}</div>
                        {metadata?.phone && (
                          <div className="text-xs text-muted-foreground">
                            {metadata.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <Link
                          href={`/admin/orders?orderId=${order?.id}`}
                          className="hover:underline text-primary"
                        >
                          {ticket.order_id?.substring(0, 8)}...
                        </Link>
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
                          ? new Date(order.created_at).toLocaleString(DEFAULT_LOCALE, {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {route && (
                          <TicketActionsCell
                            ticketId={ticket.id}
                            routeId={ticket.route_id}
                            seatNo={ticket.seat_no}
                            status={ticket.status}
                            customerName={customerName}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No tickets found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


