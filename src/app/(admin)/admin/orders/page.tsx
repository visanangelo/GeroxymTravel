import Link from 'next/link'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Plus } from 'lucide-react'

const ITEMS_PER_PAGE = 20

// Avoid static preload chunk issues (Turbopack "module factory is not available")
export const dynamic = 'force-dynamic'

// Cache orders query for instant navigation
// Note: revalidate cannot be used together with dynamic = 'force-dynamic'
const getOrders = cache(async (from: number, to: number) => {
  const supabase = await createClient()
  return supabase
    .from('orders')
    .select(
      `
      id,
      quantity,
      amount_cents,
      currency,
      source,
      status,
      metadata,
      created_at,
      user_id,
      customer_id,
      route_id,
      routes (
        origin,
        destination,
        depart_at
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)
})

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ page?: string }>
}

// Default locale for admin (no locale in URL)
const DEFAULT_LOCALE = 'ro'

export default async function OrdersListPage({ params, searchParams }: Props) {
  await params // Admin routes don't have params, but we await for consistency
  const { page = '1' } = await searchParams

  // Calculate pagination
  const pageNum = parseInt(page) || 1
  const from = (pageNum - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  // Fetch orders with route info (cached for instant navigation)
  const { data: orders, error, count } = await getOrders(from, to)

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Error loading orders: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage all orders and bookings
          </p>
        </div>
        <Link href="/admin/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Offline Order
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Orders ({count || 0})</CardTitle>
            {count && count > ITEMS_PER_PAGE && (
              <div className="flex gap-2">
                {pageNum > 1 && (
                  <Link href={`/admin/orders?page=${pageNum - 1}`}>
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                {pageNum * ITEMS_PER_PAGE < count && (
                  <Link href={`/admin/orders?page=${pageNum + 1}`}>
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
          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => {
                  const route = order.routes
                  const metadata = order.metadata as { customer_name?: string; phone?: string } | null
                  const customerName = metadata?.customer_name || order.user_id?.substring(0, 8) || 'N/A'

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {route ? (
                          <div>
                            <div className="font-medium">
                              {route.origin} → {route.destination}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(route.depart_at).toLocaleDateString('ro-RO')}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <div>{customerName}</div>
                        {metadata?.phone && (
                          <div className="text-xs text-muted-foreground">
                            {metadata.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        {formatCurrency(order.amount_cents / 100, order.currency)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            order.source === 'online'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}
                        >
                          {order.source}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            order.status === 'paid' || order.status === 'paid_offline'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : order.status === 'failed'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleString('ro-RO', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No orders found. Create your first offline order to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

