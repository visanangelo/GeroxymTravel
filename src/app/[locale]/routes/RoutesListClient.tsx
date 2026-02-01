'use client'

import { useState, useMemo, useRef, useCallback, memo } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Calendar, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import RouteSearchFilters from '@/components/routes/RouteSearchFilters'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RouteWithAvailability } from './actions'

const CATEGORY_LABELS: Record<string, string> = {
  intern: 'Interne',
  extern: 'Externe',
  pelerinaj: 'Pelerinaje',
  sejur_mare: 'Sejur la mare',
}

const CATEGORIES = [
  { id: '', label: 'Toate circuitele' },
  { id: 'intern', label: 'Interne' },
  { id: 'extern', label: 'Externe' },
  { id: 'pelerinaj', label: 'Pelerinaje' },
  { id: 'sejur_mare', label: 'Sejur la mare' },
] as const

const SEJUR_SUBCATEGORIES = [
  { id: 'grecia', label: 'Grecia' },
  { id: 'turcia', label: 'Turcia' },
  { id: 'albania', label: 'Albania' },
  { id: 'bulgaria', label: 'Bulgaria' },
] as const

// Whitelist pentru validare securizată
const VALID_CATEGORIES = new Set(['', 'intern', 'extern', 'pelerinaj', 'sejur_mare'])
const VALID_SUBCATEGORIES = new Set(['', 'grecia', 'turcia', 'albania', 'bulgaria'])

/** Sanitizează și validează input text (origin, destination) */
function sanitizeTextInput(input: string): string {
  return input
    .trim()
    .slice(0, 100) // Max 100 caractere
    .replace(/[<>{}]/g, '') // Remove caractere periculoase
}

/** Validează categoria din URL/input */
function validateCategory(cat: string | undefined): string {
  if (!cat || !VALID_CATEGORIES.has(cat)) return ''
  return cat
}

/** Validează subcategoria din URL/input */
function validateSubcategory(sub: string | undefined): string {
  if (!sub || !VALID_SUBCATEGORIES.has(sub)) return ''
  return sub
}

/** Validează data (YYYY-MM-DD format) */
function validateDate(dateStr: string): boolean {
  if (!dateStr) return false
  // Verifică format YYYY-MM-DD și că e o dată validă
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateStr)) return false
  const d = new Date(dateStr)
  return !isNaN(d.getTime())
}

const SORT_OPTIONS = [
  { id: '', label: 'Dată (apropiată)' },
  { id: 'price_asc', label: 'Preț crescător' },
  { id: 'price_desc', label: 'Preț descrescător' },
] as const

const VALID_SORT_OPTIONS = new Set(['', 'price_asc', 'price_desc'])

type Props = {
  locale: string
  initialRoutes: RouteWithAvailability[]
  /** Optional: from URL deep link (e.g. nav "Interne"). No refetch, only initial filter state. */
  initialCategory?: string
  initialSubcategory?: string
}

function getCategoryLabel(route: RouteWithAvailability): string {
  if (route.route_category === 'sejur_mare' && route.route_subcategory) {
    const sub: Record<string, string> = { grecia: 'Grecia', turcia: 'Turcia', albania: 'Albania', bulgaria: 'Bulgaria' }
    return sub[route.route_subcategory] ?? route.route_subcategory
  }
  return route.route_category ? CATEGORY_LABELS[route.route_category] ?? '' : ''
}

const RouteCard = memo(function RouteCard({
  route,
  locale,
}: {
  route: RouteWithAvailability
  locale: string
}) {
  const categoryLabel = getCategoryLabel(route)
  return (
    <Link
      href={`/${locale}/routes/${route.id}`}
      className="route-card group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
        {route.image_url ? (
          <img
            src={route.image_url}
            alt={`${route.origin} → ${route.destination}`}
            className="route-card-image h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/80">
            <MapPin className="h-14 w-14 text-muted-foreground/60" />
          </div>
        )}
        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {/* Category badge */}
        {categoryLabel && (
          <span className="absolute left-3 top-3 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            {categoryLabel}
          </span>
        )}
        {route.onlineRemaining > 0 && route.onlineRemaining <= 10 && (
          <span className="absolute right-3 top-3 rounded-lg bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground">
            {route.onlineRemaining} locuri
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-2 transition-colors duration-200 group-hover:text-primary line-clamp-2 min-w-0 tracking-tight">
          {route.origin} → {route.destination}
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>
            {new Date(route.depart_at).toLocaleDateString(locale, { dateStyle: 'medium' })} ·{' '}
            {new Date(route.depart_at).toLocaleTimeString(locale, { timeStyle: 'short' })}
          </span>
        </div>
        <div className="flex items-end justify-between pt-4 border-t border-border mt-auto gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Pornind de la</p>
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {formatCurrency(route.price_cents / 100, route.currency)}
            </span>
            <span className="text-sm text-muted-foreground">/bilet</span>
          </div>
          <span className="route-card-arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  )
})

export default function RoutesListClient({
  locale,
  initialRoutes,
  initialCategory = '',
  initialSubcategory = '',
}: Props) {
  // Validăm input-ul din URL înainte să-l folosim
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState(validateCategory(initialCategory))
  const [subcategory, setSubcategory] = useState(validateSubcategory(initialSubcategory))
  const [sortBy, setSortBy] = useState('')

  /** Realtime filter + sort: single source (initialRoutes), no fetch, no URL. */
  const filteredRoutes = useMemo(() => {
    let list = initialRoutes

    // Filtrare categoria (deja validată prin whitelist)
    if (category && VALID_CATEGORIES.has(category)) {
      list = list.filter((r) => r.route_category === category)
    }
    // Filtrare subcategoria (deja validată prin whitelist)
    if (subcategory && VALID_SUBCATEGORIES.has(subcategory)) {
      list = list.filter((r) => r.route_subcategory === subcategory)
    }
    // Filtrare origin (sanitizat)
    const cleanOrigin = sanitizeTextInput(origin)
    if (cleanOrigin) {
      const q = cleanOrigin.toLowerCase()
      list = list.filter((r) => r.origin.toLowerCase().includes(q))
    }
    // Filtrare destination (sanitizat)
    const cleanDestination = sanitizeTextInput(destination)
    if (cleanDestination) {
      const q = cleanDestination.toLowerCase()
      list = list.filter((r) => r.destination.toLowerCase().includes(q))
    }
    // Filtrare dată (validată)
    if (date && validateDate(date)) {
      const d = new Date(date)
      const dayStart = new Date(d)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(d)
      dayEnd.setHours(23, 59, 59, 999)
      const start = dayStart.getTime()
      const end = dayEnd.getTime()
      list = list.filter((r) => {
        const t = new Date(r.depart_at).getTime()
        return t >= start && t <= end
      })
    }

    const sorted = [...list]
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price_cents - b.price_cents || new Date(a.depart_at).getTime() - new Date(b.depart_at).getTime())
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.price_cents - a.price_cents || new Date(a.depart_at).getTime() - new Date(b.depart_at).getTime())
    } else {
      sorted.sort((a, b) => new Date(a.depart_at).getTime() - new Date(b.depart_at).getTime())
    }
    return sorted
  }, [initialRoutes, category, subcategory, origin, destination, date, sortBy])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleClear = () => {
    setOrigin('')
    setDestination('')
    setDate('')
  }

  const resultsRef = useRef<HTMLDivElement>(null)

  const scrollToResults = useCallback(() => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  /** Update URL without page reload (for sharing) */
  const updateURL = useCallback((cat: string, sub: string) => {
    const params = new URLSearchParams()
    if (cat) params.set('category', cat)
    if (sub) params.set('subcategory', sub)
    const query = params.toString()
    const newURL = query ? `/${locale}/routes?${query}` : `/${locale}/routes`
    window.history.pushState(null, '', newURL)
  }, [locale])

  const handleCategoryChange = (cat: string) => {
    // Validare: doar categorii din whitelist
    const validCat = validateCategory(cat)
    
    // Dacă e sejur_mare, nu activăm categoria până când nu selectează subcategoria
    if (validCat === 'sejur_mare') {
      // Doar arată subcategoriile, fără să schimbăm categoria
      // (categoria rămâne ce era înainte, iar subcategoriile apar)
      setCategory(validCat)
      setSubcategory('') // resetăm subcategoria pentru a arăta că trebuie să aleagă
      // NU facem scroll și NU update URL pentru că nu am activat niciun filtru
      return
    }
    // Pentru celelalte categorii, activăm direct
    setCategory(validCat)
    setSubcategory('')
    updateURL(validCat, '') // Update URL pentru share
    scrollToResults()
  }

  const handleSubcategoryChange = (sub: string) => {
    // Validare: doar subcategorii din whitelist
    const validSub = validateSubcategory(sub)
    
    // Când selectează o subcategorie, activăm și categoria sejur_mare
    // Când șterge subcategoria (sub === ''), rămânem pe sejur_mare dar fără subcategorie
    if (validSub === '') {
      setSubcategory('')
      updateURL('sejur_mare', '') // Sejur la mare fără subcategorie
      scrollToResults()
    } else {
      setCategory('sejur_mare')
      setSubcategory(validSub)
      updateURL('sejur_mare', validSub) // Update URL pentru share
      scrollToResults()
    }
  }

  const handleSortChange = (sort: string) => {
    // Validare: doar opțiuni valide de sortare
    if (VALID_SORT_OPTIONS.has(sort)) {
      setSortBy(sort)
    }
  }

  const hasActiveFilters = origin !== '' || destination !== '' || date !== ''
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? 'Dată (apropiată)'

  return (
    <div className="space-y-8">
      {/* Categorii: buline – pe mobil scroll orizontal (padding sigur), pe desktop wrap */}
      <section aria-label="Categorii circuite" className="space-y-4">
        <div className="relative min-w-0">
          {/* Mobil: scroll orizontal – bulinele nu ies din cadru (padding + touch scroll) */}
          <div
            className="routes-category-scroll md:hidden overflow-x-auto overflow-y-hidden -mx-4 px-4 pb-2"
            style={{ scrollPaddingInline: '1rem' }}
          >
            <div className="flex flex-nowrap gap-2.5 py-1 min-w-max">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 whitespace-nowrap ${
                    category === cat.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/80 text-muted-foreground active:bg-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          {/* Desktop: wrap normal */}
          <div className="hidden md:flex md:flex-wrap md:gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  category === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {category === 'sejur_mare' && (
            <>
              {/* Mobil: subcategorii tot ca buline, scroll orizontal */}
              <div className="routes-category-scroll mt-4 md:hidden -mx-4 px-4 overflow-x-auto overflow-y-hidden pb-1">
                <div className="flex flex-nowrap gap-2 py-0.5 min-w-max">
                  {SEJUR_SUBCATEGORIES.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubcategoryChange(sub.id)}
                      className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                        subcategory === sub.id ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-muted/70 text-muted-foreground'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                  {subcategory && (
                    <button type="button" onClick={() => handleSubcategoryChange('')} className="shrink-0 rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground underline whitespace-nowrap">
                      Toate
                    </button>
                  )}
                </div>
              </div>
              {/* Desktop: wrap */}
              <div className="mt-4 hidden md:flex md:flex-wrap md:gap-2 md:pl-2 md:border-l-4 md:border-primary/20">
                <span className="sr-only">Destinație sejur la mare</span>
                {SEJUR_SUBCATEGORIES.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubcategoryChange(sub.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      subcategory === sub.id
                        ? 'bg-primary/15 text-primary border border-primary/50'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
                {subcategory && (
                  <button
                    type="button"
                    onClick={() => handleSubcategoryChange('')}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Toate destinațiile
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Search panel + Sort */}
      <section aria-label="Căutare și sortare">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1 w-full min-w-0">
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
              isPending={false}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
              Sortare
            </span>
            <Select value={sortBy || 'default'} onValueChange={(v) => handleSortChange(v === 'default' ? '' : v)}>
              <SelectTrigger className="w-[200px] h-10 rounded-lg border-input bg-background">
                <SelectValue placeholder="Sortare" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id || 'default'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Scroll target: zone rezultate (listă sau mesaj gol) */}
      <div ref={resultsRef} className="scroll-mt-24">
        {filteredRoutes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/5 p-12 sm:p-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground tracking-tight mb-2">
              Nicio rută găsită
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Nu există circuite care să corespundă filtrelor. Încearcă altă categorie sau șterge filtrele de căutare.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={handleClear} className="rounded-lg">
                Șterge filtre căutare
              </Button>
              <Button variant="secondary" className="rounded-lg" onClick={() => handleCategoryChange('')}>
                Vezi toate circuitele
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredRoutes.length}</span>
              <span>{filteredRoutes.length === 1 ? 'circuit disponibil' : 'circuite disponibile'}</span>
              <span className="hidden sm:inline" aria-hidden>·</span>
              <span className="hidden sm:inline">Sortat: {sortLabel}</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
              {filteredRoutes.map((route) => (
                <RouteCard key={route.id} route={route} locale={locale} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
