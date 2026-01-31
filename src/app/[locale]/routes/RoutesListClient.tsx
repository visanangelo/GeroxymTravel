'use client'

import { useState, useCallback, useRef, useTransition, memo } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import RouteSearchFilters from '@/components/routes/RouteSearchFilters'
import { Button } from '@/components/ui/button'
import { getFilteredRoutes, type RouteWithAvailability } from './actions'
import { useDebounce } from '@/hooks/use-debounce'

const DEBOUNCE_MS = 300

type Props = {
  locale: string
  initialRoutes: RouteWithAvailability[]
}

const RouteCard = memo(function RouteCard({
  route,
  locale,
}: {
  route: RouteWithAvailability
  locale: string
}) {
  return (
    <Link
      href={`/${locale}/routes/${route.id}`}
      className="route-card group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
        {route.image_url ? (
          <img
            src={route.image_url}
            alt={`${route.origin} → ${route.destination}`}
            className="route-card-image h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {route.onlineRemaining > 0 && route.onlineRemaining <= 10 && (
          <span className="absolute right-2 top-2 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground">
            {route.onlineRemaining} locuri
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-2 transition-colors duration-300 ease-out group-hover:text-primary line-clamp-2 min-w-0 tracking-tight">
          {route.origin} → {route.destination}
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>
            {new Date(route.depart_at).toLocaleDateString(locale, { dateStyle: 'short' })} ·{' '}
            {new Date(route.depart_at).toLocaleTimeString(locale, { timeStyle: 'short' })}
          </span>
        </div>
        <div className="flex items-end justify-between pt-4 border-t border-border mt-auto">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pornind de la</p>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(route.price_cents / 100, route.currency)}
            </span>
            <span className="text-sm text-muted-foreground">/bilet</span>
          </div>
          <span className="route-card-arrow flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
})

export default function RoutesListClient({ locale, initialRoutes }: Props) {
  const [routes, setRoutes] = useState<RouteWithAvailability[]>(initialRoutes)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isFirstMount = useRef(true)
  const requestIdRef = useRef(0)
  const [isPending, startTransition] = useTransition()

  const fetchFiltered = useCallback(
    (o: string, d: string, dt: string) => {
      requestIdRef.current += 1
      const id = requestIdRef.current
      startTransition(() => {
        getFilteredRoutes({
          origin: o.trim() || undefined,
          destination: d.trim() || undefined,
          date: dt || undefined,
          requestId: String(id),
        }).then((result) => {
          if (result.requestId !== String(id)) return
          if (result.error) {
            setError(result.error)
            return
          }
          setError(null)
          setRoutes(result.routes)
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
      fetchFiltered(origin, destination, date)
    },
    DEBOUNCE_MS,
    [origin, destination, date]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFiltered(origin, destination, date)
  }

  const handleClear = () => {
    setOrigin('')
    setDestination('')
    setDate('')
    fetchFiltered('', '', '')
  }

  const hasActiveFilters = origin !== '' || destination !== '' || date !== ''

  return (
    <>
      <RouteSearchFilters
        origin={origin}
        destination={destination}
        date={date}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onDateChange={setDate}
        onSubmit={handleSubmit}
        onClear={handleClear}
        hasActiveFilters={hasActiveFilters}
        isPending={isPending}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
          {error}
        </div>
      ) : routes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="font-display mb-2 text-xl font-semibold text-foreground tracking-tight">Nicio rută găsită</h3>
          <p className="mb-6 text-muted-foreground">
            Nu există rute disponibile momentan. Încearcă alte filtre.
          </p>
          <Button variant="outline" onClick={handleClear}>
            Șterge filtre
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-muted-foreground">
            <span className="font-medium text-foreground">{routes.length}</span> rute disponibile
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} locale={locale} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
