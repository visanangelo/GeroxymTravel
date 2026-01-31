import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'
import { createServiceClient } from '@/lib/supabase/service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Route, Plus, Users, Ticket } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const DASHBOARD_CACHE_REVALIDATE = 15

type Props = {
  params: Promise<{ locale?: string }>
  searchParams: Promise<{ period?: string }>
}

/** Dashboard KPIs from view admin_dashboard_stats (one query, single source of truth). */
async function getCachedDashboardStats() {
  const getter = unstable_cache(
    async () => {
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select(
          'active_routes_count, draft_routes_count, cancelled_routes_count, online_seats_sold, online_seats_available, total_offline_reserve'
        )
        .single()
      if (error) return null
      return data
    },
    ['dashboard-stats'],
    { revalidate: DASHBOARD_CACHE_REVALIDATE, tags: ['dashboard-stats'] }
  )
  return getter()
}

async function getCachedRecentRoutes(dateFilter: { gte: string; lt: string }, period: string) {
  const getter = unstable_cache(
    async () => {
      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from('routes')
        .select('id, origin, destination, depart_at, status, price_cents, currency')
        .gte('depart_at', dateFilter.gte)
        .lt('depart_at', dateFilter.lt)
        .order('depart_at', { ascending: true })
        .limit(10)
      if (error) return []
      return data ?? []
    },
    ['dashboard-routes', period],
    { revalidate: DASHBOARD_CACHE_REVALIDATE, tags: ['dashboard-routes'] }
  )
  return getter()
}

function KPICardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentRoutesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function DashboardKPIs() {
  const stats = await getCachedDashboardStats()
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.active_routes_count ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.draft_routes_count ?? 0} draft, {stats?.cancelled_routes_count ?? 0} cancelled
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online Seats Sold</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.online_seats_sold ?? 0}</div>
          <p className="text-xs text-muted-foreground">{stats?.online_seats_available ?? 0} available</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online Seats Available</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.online_seats_available ?? 0}</div>
          <p className="text-xs text-muted-foreground">Available for booking</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Offline Reserve</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total_offline_reserve ?? 0}</div>
          <p className="text-xs text-muted-foreground">Reserved for offline sales</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function RecentRoutesTable({ period, dateFilter }: { period: string; dateFilter: { gte: string; lt: string } }) {
  const recentRoutes = await getCachedRecentRoutes(dateFilter, period)
  const periodLabel = period === 'next' ? 'Next Week' : 'This Week'
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Routes {periodLabel}</CardTitle>
            <CardDescription>Upcoming routes scheduled for {period === 'next' ? 'next week' : 'this week'}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/admin?period=week">
              <Button variant={period === 'week' ? 'default' : 'outline'} size="sm">
                This Week
              </Button>
            </Link>
            <Link href="/admin?period=next">
              <Button variant={period === 'next' ? 'default' : 'outline'} size="sm">
                Next Week
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentRoutes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">
                    {route.origin} → {route.destination}
                  </TableCell>
                  <TableCell>
                    {new Date(route.depart_at).toLocaleString('ro-RO', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        route.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : route.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}
                    >
                      {route.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(route.price_cents / 100, route.currency)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/routes/${route.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No routes scheduled for {period === 'next' ? 'next week' : 'this week'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const revalidate = 15

export default async function AdminDashboardPage({ params, searchParams }: Props) {
  await params
  const { period = 'week' } = await searchParams

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  const startOfNextWeek = new Date(endOfWeek)
  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 7)

  const dateFilter =
    period === 'next'
      ? { gte: startOfNextWeek.toISOString(), lt: endOfNextWeek.toISOString() }
      : { gte: startOfWeek.toISOString(), lt: endOfWeek.toISOString() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of routes and bookings</p>
        </div>
        <Link href="/admin/routes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Route
          </Button>
        </Link>
      </div>

      <Suspense fallback={<KPICardsSkeleton />}>
        <DashboardKPIs />
      </Suspense>

      <Suspense fallback={<RecentRoutesSkeleton />}>
        <RecentRoutesTable period={period} dateFilter={dateFilter} />
      </Suspense>
    </div>
  )
}
