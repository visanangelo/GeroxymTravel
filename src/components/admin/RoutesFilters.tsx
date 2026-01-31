'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X } from 'lucide-react'

export type AdminFiltersState = {
  origin: string
  destination: string
  status: string
  dateFrom: string
  dateTo: string
  sort: string
}

type Props = {
  filters: AdminFiltersState
  onOriginChange: (v: string) => void
  onDestinationChange: (v: string) => void
  onStatusChange: (v: string) => void
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onSortChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClear: () => void
  hasActiveFilters: boolean
  isPending: boolean
}

export default function RoutesFilters({
  filters,
  onOriginChange,
  onDestinationChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onSubmit,
  onClear,
  hasActiveFilters,
  isPending,
}: Props) {
  const { origin, destination, status, dateFrom, dateTo, sort } = filters

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Origin</label>
              <Input
                placeholder="Filter by origin..."
                value={origin}
                onChange={(e) => onOriginChange(e.target.value)}
                type="text"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Destination</label>
              <Input
                placeholder="Filter by destination..."
                value={destination}
                onChange={(e) => onDestinationChange(e.target.value)}
                type="text"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium mb-0">Sort By</label>
              <Select value={sort} onValueChange={onSortChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="depart_at_desc">Departure (Newest)</SelectItem>
                  <SelectItem value="depart_at_asc">Departure (Oldest)</SelectItem>
                  <SelectItem value="origin_asc">Origin (A-Z)</SelectItem>
                  <SelectItem value="destination_asc">Destination (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" size="sm" disabled={isPending}>
                <Search className="mr-2 h-4 w-4" />
                {isPending ? 'Se aplică…' : 'Aplică filtre'}
              </Button>
            </div>
            {hasActiveFilters && (
              <Button type="button" variant="outline" onClick={onClear} disabled={isPending}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
