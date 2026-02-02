'use client'

import { useState, useCallback, useRef, useTransition, memo, useEffect, useMemo } from 'react'
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
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import RoutesFilters, { type AdminFiltersState } from '@/components/admin/RoutesFilters'
import { RouteActionsMenu } from '@/components/admin/RouteActionsMenu'
import { getAdminRoutes } from './actions'
import type { OccupiedPositionRow } from '@/lib/admin/routes-actions'
import { useDebounce } from '@/hooks/use-debounce'
import { Database } from '@/lib/supabase/database.types'

const DEBOUNCE_MS = 300
const ITEMS_PER_PAGE = 20
const DEFAULT_LOCALE = 'ro'

type Route = Database['public']['Tables']['routes']['Row']

type Props = {
  initialRoutes: Route[]
  initialCount: number
  /** Pozițiile ocupate din DB (pentru dropdown corect după create) */
  initialOccupiedPositions?: OccupiedPositionRow[]
}

/** Cache pentru paginile prefetch-uite - face navigarea instant */
type PageCache = Map<number, { routes: Route[]; count: number; timestamp: number }>
const CACHE_TTL_MS = 30_000 // 30 secunde

const defaultFilters: AdminFiltersState = {
  origin: '',
  destination: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  sort: 'depart_at_desc',
}

/** Info despre pozițiile ocupate pe homepage */
type OccupiedPosition = {
  position: number
  routeId: string
  routeName: string
}

const AdminRouteRow = memo(function AdminRouteRow({
  route,
  onActionSuccess,
  onPositionChange,
  occupiedPositions,
}: {
  route: Route
  onActionSuccess?: () => void
  /** Optimistic update pentru poziție (instant UI update) */
  onPositionChange?: (routeId: string, newPosition: number | null) => void
  /** Lista pozițiilor ocupate pentru dropdown */
  occupiedPositions: OccupiedPosition[]
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
        <RouteActionsMenu 
          route={route} 
          onActionSuccess={onActionSuccess}
          onPositionChange={onPositionChange}
          occupiedPositions={occupiedPositions}
        />
      </TableCell>
    </TableRow>
  )
})

export default function AdminRoutesListClient({ initialRoutes, initialCount, initialOccupiedPositions = [] }: Props) {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes)
  const [count, setCount] = useState(initialCount)
  const [filters, setFilters] = useState<AdminFiltersState>(defaultFilters)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const isFirstMount = useRef(true)
  const requestIdRef = useRef(0)
  const [isPending, startTransition] = useTransition()
  
  // Cache pentru paginile prefetch-uite
  const pageCacheRef = useRef<PageCache>(new Map())
  const filtersKeyRef = useRef<string>('')

  // Generează cheie unică pentru filtrele curente
  const getFiltersKey = useCallback((f: AdminFiltersState) => {
    return JSON.stringify([f.origin, f.destination, f.status, f.dateFrom, f.dateTo, f.sort])
  }, [])

  // Prefetch o pagină în background (fără UI update)
  const prefetchPage = useCallback((f: AdminFiltersState, p: number) => {
    const currentFilterKey = getFiltersKey(f)
    const cache = pageCacheRef.current
    const cached = cache.get(p)
    
    // Skip dacă e deja în cache și valid (și filtrele sunt aceleași)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && filtersKeyRef.current === currentFilterKey) return
    
    getAdminRoutes({
      origin: f.origin.trim() || undefined,
      destination: f.destination.trim() || undefined,
      status: f.status !== 'all' ? f.status : undefined,
      dateFrom: f.dateFrom || undefined,
      dateTo: f.dateTo || undefined,
      sort: f.sort,
      page: p,
      requestId: `prefetch-${p}`,
    }).then((result) => {
      // Salvează în cache doar dacă filtrele sunt încă aceleași
      if (!result.error && filtersKeyRef.current === currentFilterKey) {
        cache.set(p, { routes: result.routes, count: result.count, timestamp: Date.now() })
      }
    })
  }, [getFiltersKey])

  // Prefetch paginile adiacente când se schimbă pagina
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(count / ITEMS_PER_PAGE))
    
    // Prefetch pagina următoare
    if (page < totalPages) {
      prefetchPage(filters, page + 1)
    }
    // Prefetch pagina anterioară
    if (page > 1) {
      prefetchPage(filters, page - 1)
    }
  }, [page, count, filters, prefetchPage])

  const fetchFiltered = useCallback(
    (f: AdminFiltersState, p: number, forceRefresh = false) => {
      const currentFilterKey = getFiltersKey(f)
      const cache = pageCacheRef.current
      const cached = cache.get(p)
      
      // Check cache pentru navigare instant (doar dacă filtrele sunt aceleași)
      if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS && filtersKeyRef.current === currentFilterKey) {
        // INSTANT: folosim datele din cache
        setRoutes(cached.routes)
        setCount(cached.count)
        setError(null)
        return
      }
      
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
          // Cache rezultatul doar dacă filtrele sunt încă aceleași
          if (filtersKeyRef.current === currentFilterKey) {
            cache.set(p, { routes: result.routes, count: result.count, timestamp: Date.now() })
          }
        })
      })
    },
    [startTransition, getFiltersKey]
  )

  // Când se schimbă filtrele: invalidează cache, reset la pagina 1, fetch nou
  useDebounce(
    () => {
      if (isFirstMount.current) {
        isFirstMount.current = false
        return
      }
      // Invalidează cache-ul când se schimbă filtrele
      const newKey = getFiltersKey(filters)
      if (filtersKeyRef.current !== newKey) {
        filtersKeyRef.current = newKey
        pageCacheRef.current.clear()
      }
      // Reset la pagina 1 și fetch
      setPage(1)
      fetchFiltered(filters, 1, true) // forceRefresh = true pentru a ignora cache
    },
    DEBOUNCE_MS,
    [filters.origin, filters.destination, filters.status, filters.dateFrom, filters.dateTo, filters.sort]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    pageCacheRef.current.clear()
    filtersKeyRef.current = getFiltersKey(filters)
    setPage(1)
    fetchFiltered(filters, 1, true)
  }

  const handleClear = () => {
    pageCacheRef.current.clear()
    filtersKeyRef.current = getFiltersKey(defaultFilters)
    setFilters(defaultFilters)
    setPage(1)
    fetchFiltered(defaultFilters, 1, true)
  }

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
    fetchFiltered(filters, newPage)
  }, [filters, fetchFiltered])

  const refetchList = useCallback(() => {
    // Force refresh pentru a ignora cache
    pageCacheRef.current.clear()
    fetchFiltered(filters, page, true)
  }, [fetchFiltered, filters, page])

  /** Optimistic update pentru poziția pe homepage - instant, fără refetch
   *  Include și swap-ul cu ruta care ocupa poziția (dacă există)
   */
  const handlePositionChange = useCallback((routeId: string, newPosition: number | null) => {
    setRoutes(prev => {
      const currentRoute = prev.find(r => r.id === routeId)
      const oldPosition = currentRoute?.homepage_position != null ? Number(currentRoute.homepage_position) : null
      
      return prev.map(r => {
        if (r.id === routeId) {
          return { ...r, homepage_position: newPosition }
        }
        const rPos = r.homepage_position != null ? Number(r.homepage_position) : null
        if (newPosition !== null && rPos === newPosition) {
          return { ...r, homepage_position: oldPosition }
        }
        return r
      })
    })
    // Invalidează cache-ul pentru că datele s-au schimbat
    pageCacheRef.current.clear()
  }, [])

  /** Pozițiile ocupate: server (toate) + override cu routes curentă pagină (optimistic) */
  const occupiedPositions = useMemo<OccupiedPosition[]>(() => {
    const fromRoutes = routes
      .filter(r => r.homepage_position != null)
      .map(r => ({
        position: Number(r.homepage_position) as number,
        routeId: r.id,
        routeName: `${r.origin} → ${r.destination}`,
      }))
    const byPosition = new Map<number, OccupiedPosition>()
    for (const o of initialOccupiedPositions) {
      byPosition.set(Number(o.position), { ...o, position: Number(o.position) })
    }
    for (const o of fromRoutes) {
      byPosition.set(o.position, o)
    }
    return Array.from(byPosition.values())
  }, [routes, initialOccupiedPositions])

  // Keyboard shortcuts pentru navigare rapidă (← →)
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(count / ITEMS_PER_PAGE))
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Nu intercepta dacă user-ul e într-un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key === 'ArrowLeft' && page > 1) {
        e.preventDefault()
        goToPage(page - 1)
      } else if (e.key === 'ArrowRight' && page < totalPages) {
        e.preventDefault()
        goToPage(page + 1)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [page, count, goToPage])

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
                          onPositionChange={handlePositionChange}
                          occupiedPositions={occupiedPositions}
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      {/* Page numbers pentru navigare rapidă */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (page <= 3) {
                            pageNum = i + 1
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = page - 2 + i
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? 'default' : 'ghost'}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => goToPage(pageNum)}
                              onMouseEnter={() => prefetchPage(filters, pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
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
