'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

type Props = {
  origin: string
  destination: string
  date: string
  onOriginChange: (v: string) => void
  onDestinationChange: (v: string) => void
  onDateChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClear: () => void
  hasActiveFilters: boolean
  isPending: boolean
}

export default function RouteSearchFilters({
  origin,
  destination,
  date,
  onOriginChange,
  onDestinationChange,
  onDateChange,
  onSubmit,
  onClear,
  hasActiveFilters,
  isPending,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/5 px-5 py-5 sm:px-6 sm:py-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <label htmlFor="route-origin" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Plecare
          </label>
          <Input
            id="route-origin"
            className="h-10 bg-background border-input focus-visible:ring-2"
            placeholder="ex. Drobeta-Turnu Severin"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            type="text"
            autoComplete="off"
            aria-busy={isPending}
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <label htmlFor="route-destination" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Destinație
          </label>
          <Input
            id="route-destination"
            className="h-10 bg-background border-input focus-visible:ring-2"
            placeholder="ex. București, Constanța"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            type="text"
            autoComplete="off"
            aria-busy={isPending}
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <label htmlFor="route-date" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Data plecării
          </label>
          <Input
            id="route-date"
            type="date"
            className="h-10 bg-background border-input focus-visible:ring-2"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            aria-busy={isPending}
          />
        </div>
        <div className="flex gap-2 pt-1 sm:pt-0">
          <Button
            type="submit"
            size="default"
            className="h-10 rounded-lg px-5 font-medium shadow-sm"
            disabled={isPending}
          >
            <Search className="mr-2 h-4 w-4" />
            {isPending ? 'Se caută…' : 'Caută'}
          </Button>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg shrink-0"
              onClick={onClear}
              aria-label="Șterge filtre căutare"
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
