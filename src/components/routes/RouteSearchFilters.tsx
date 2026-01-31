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
    <form onSubmit={onSubmit} className="mb-10 rounded-xl bg-secondary border border-border px-6 py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
        <div className="flex-1 min-w-0">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Oraș plecare</label>
          <Input
            className="bg-card border-input"
            placeholder="Alege oraș..."
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            type="text"
            autoComplete="off"
            aria-busy={isPending}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Destinație</label>
          <Input
            className="bg-card border-input"
            placeholder="Alege destinația..."
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            type="text"
            autoComplete="off"
            aria-busy={isPending}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Data</label>
          <Input
            type="date"
            className="bg-card border-input"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            aria-busy={isPending}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="rounded-full px-6" disabled={isPending}>
            <Search className="mr-2 h-4 w-4" />
            {isPending ? 'Se caută…' : 'Caută rute'}
          </Button>
          {hasActiveFilters && (
            <Button type="button" variant="outline" size="icon" onClick={onClear} aria-label="Șterge filtre" disabled={isPending}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
