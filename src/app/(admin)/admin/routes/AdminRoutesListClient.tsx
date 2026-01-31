'use client'

import { useState, useCallback, useRef, useTransition, memo } from 'react'
import { useRouter } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import { ImageOff } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import RoutesFilters, { type AdminFiltersState } from '@/components/admin/RoutesFilters'
import { RouteActionsMenu } from '@/components/admin/RouteActionsMenu'
import { getAdminRoutes } from './actions'
import { useDebounce } from '@/hooks/use-debounce'
import { Database } from '@/lib/supabase/database.types'

const DEBOUNCE_MS = 300
const ITEMS_PER_PAGE = 20
const DEFAULT_LOCALE = 'ro'

type Route = Database['public']['Tables']['routes']['Row']

type Props = {
  initialRoutes: Route[]
  initialCount: number
}

const defaultFilters: AdminFiltersState = {
  origin: '',
  destination: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  sort: 'depart_at_desc',
}

const AdminRouteRow = memo(function AdminRouteRow({
  route,
  onActionSuccess,
}: {
  route: Route
  onActionSuccess?: () => void
}) {
  const router = useRouter()
  return (
    <TableRow
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => router.push(`/admin/routes/${route.id}`)}
    >
      <TableCell className="p-2">
        {route.image_url ? (
          <div className="relative w-12 h-10 rounded overflow-hidden bg-muted">
            <img src={route.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-10 rounded bg-muted flex items-center justify-center">
            <ImageOff className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{route.origin}</TableCell>
      <TableCell className="font-medium">{route.destination}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(route.depart_at).toLocaleString(DEFAULT_LOCALE, {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge
            variant={route.status === 'active' ? 'default' : route.status === 'cancelled' ? 'destructive' : 'secondary'}
            className={
              route.status === 'active'
                ? 'bg-green-500 hover:bg-green-600 w-fit'
                : route.status === 'cancelled'
                ? 'bg-red-500 hover:bg-red-600 w-fit'
                : 'bg-gray-500 hover:bg-gray-600 w-fit'
            }
          >
            {route.status}
          </Badge>
          {route.homepage_position != null && (
            <span className="text-xs text-muted-foreground">Poz. {route.homepage_position}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">{route.capacity_total}</span>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300">
          {route.reserve_offline}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
          {route.capacity_online}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-semibold">
          {formatCurrency(route.price_cents / 100, route.currency)}
        </span>
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <RouteActionsMenu route={route} onActionSuccess={onActionSuccess} />
      </TableCell>
    </TableRow>
  )
})

export default function AdminRoutesListClient({ initialRoutes, initialCount }: Props) {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes)
  const [count, setCount] = useState(initialCount)
  const [filters, setFilters] = useState<AdminFiltersState>(defaultFilters)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const isFirstMount = useRef(true)
  const requestIdRef = useRef(0)
  const [isPending, startTransition] = useTransition()

  const fetchFiltered = useCallback(
    (f: AdminFiltersState, p: number) => {
      requestIdRef.current += 1
      const id = requestIdRef.current
      startTransition(() => {
        getAdminRoutes({
          origin: f.origin.trim() || undefined,
          destination: f.destination.trim() || undefined,
          status: f.status !== 'all' ? f.status : undefined,
          dateFrom: f.dateFrom || undefined,
          dateTo: f.dateTo || undefined,
          sort: f.sort,
          page: p,
          requestId: String(id),
        }).then((result) => {
          if (result.requestId !== String(id)) return
          if (result.error) {
            setError(result.error)
            return
          }
          setError(null)
          setRoutes(result.routes)
          setCount(result.count)
        })
      })
    },
    [startTransition]
  )

  useDebounce(
    () => {
      if (isFirstMount.current) {
        isFirstMount.current = false
        return
      }
      fetchFiltered(filters, page)
    },
    DEBOUNCE_MS,
    [filters.origin, filters.destination, filters.status, filters.dateFrom, filters.dateTo, filters.sort]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchFiltered(filters, 1)
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    setPage(1)
    fetchFiltered(defaultFilters, 1)
  }

  const goToPage = (newPage: number) => {
    setPage(newPage)
    fetchFiltered(filters, newPage)
  }

  const refetchList = useCallback(() => {
    fetchFiltered(filters, page)
  }, [fetchFiltered, filters, page])

  const hasActiveFilters =
    filters.origin !== '' ||
    filters.destination !== '' ||
    (filters.status !== '' && filters.status !== 'all') ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''

  const totalPages = Math.max(1, Math.ceil(count / ITEMS_PER_PAGE))
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = Math.min(from + ITEMS_PER_PAGE, count)

  return (
    <div className="space-y-6">
      <RoutesFilters
        filters={filters}
        onOriginChange={(v) => setFilters((prev) => ({ ...prev, origin: v }))}
        onDestinationChange={(v) => setFilters((prev) => ({ ...prev, destination: v }))}
        onStatusChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
        onDateFromChange={(v) => setFilters((prev) => ({ ...prev, dateFrom: v }))}
        onDateToChange={(v) => setFilters((prev) => ({ ...prev, dateTo: v }))}
        onSortChange={(v) => setFilters((prev) => ({ ...prev, sort: v }))}
        onSubmit={handleSubmit}
        onClear={handleClear}
        hasActiveFilters={hasActiveFilters}
        isPending={isPending}
      />

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              All Routes ({count})
              {totalPages > 1 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - Page {page} of {totalPages}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routes.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold w-16">Cover</TableHead>
                        <TableHead className="font-semibold">Origin</TableHead>
                        <TableHead className="font-semibold">Destination</TableHead>
                        <TableHead className="font-semibold">Departure</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Capacity</TableHead>
                        <TableHead className="font-semibold">Offline Reserve</TableHead>
                        <TableHead className="font-semibold">Online Capacity</TableHead>
                        <TableHead className="font-semibold">Price</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route) => (
                        <AdminRouteRow
                          key={route.id}
                          route={route}
                          onActionSuccess={refetchList}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {from + 1} to {to} of {count} routes
                    </div>
                    <div className="flex gap-2">
                      {page > 1 && (
                        <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={isPending}>
                          Previous
                        </Button>
                      )}
                      {page < totalPages && (
                        <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={isPending}>
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No routes found. Create your first route to get started.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
