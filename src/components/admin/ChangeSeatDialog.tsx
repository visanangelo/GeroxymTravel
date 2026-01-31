'use client'

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { changeSeat } from '@/lib/admin/tickets-actions'
import { useRouter } from 'next/navigation'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
  routeId: string
  currentSeatNo: number
  /** When set (e.g. [locale]/admin), paths use /[locale]/admin; omit for (admin) */
  locale?: string
}

export default function ChangeSeatDialog({
  open,
  onOpenChange,
  ticketId,
  routeId,
  currentSeatNo,
  locale,
}: Props) {
  const router = useRouter()
  const [availableSeats, setAvailableSeats] = useState<number[]>([])
  const [selectedSeat, setSelectedSeat] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchAvailableSeats()
      setSelectedSeat('')
      setError(null)
    }
  }, [open, routeId])

  const fetchAvailableSeats = async () => {
    setFetching(true)
    const supabase = createClient()

    try {
      // Get all route seats
      const { data: routeSeats } = await supabase
        .from('route_seats')
        .select('seat_no')
        .eq('route_id', routeId)
        .order('seat_no', { ascending: true })

      // Get occupied seats
      const { data: occupiedTickets } = await supabase
        .from('tickets')
        .select('seat_no')
        .eq('route_id', routeId)
        .eq('status', 'paid')
        .neq('id', ticketId) // Exclude current ticket

      const occupiedSeats = new Set(occupiedTickets?.map((t) => t.seat_no) || [])
      const available = routeSeats
        ?.map((rs) => rs.seat_no)
        .filter((seatNo) => !occupiedSeats.has(seatNo) || seatNo === currentSeatNo) || []

      setAvailableSeats(available)
    } catch (err) {
      console.error('Error fetching available seats:', err)
      setError('Failed to load available seats')
    } finally {
      setFetching(false)
    }
  }

  const handleChangeSeat = () => {
    if (!selectedSeat) {
      setError('Please select a seat')
      return
    }

    const newSeatNo = parseInt(selectedSeat)
    if (newSeatNo === currentSeatNo) {
      setError('Please select a different seat')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await changeSeat(ticketId, newSeatNo, locale)
        onOpenChange(false)
        toast.success('Loc schimbat', { id: `seat-changed-${ticketId}` })
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to change seat'
        setError(msg)
        toast.error(msg, { id: `seat-change-error-${ticketId}` })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Change Seat
          </DialogTitle>
          <DialogDescription className="text-base">
            Select a new seat for this ticket. Current seat:{' '}
            <span className="font-semibold text-foreground">{currentSeatNo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="seat-select" className="text-sm font-medium">
              New Seat Number
            </Label>
            {fetching ? (
              <div className="flex items-center justify-center py-8 border border-dashed rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading available seats...
                </span>
              </div>
            ) : (
              <Select value={selectedSeat} onValueChange={(val) => {
                setSelectedSeat(val)
                setError(null)
              }}>
                <SelectTrigger id="seat-select" className="w-full h-10">
                  <SelectValue placeholder="Select a seat" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableSeats.length > 0 ? (
                    availableSeats.map((seatNo) => (
                      <SelectItem key={seatNo} value={seatNo.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>Seat {seatNo}</span>
                          {seatNo === currentSeatNo && (
                            <span className="text-xs text-muted-foreground ml-2">(Current)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No available seats
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
            {selectedSeat && parseInt(selectedSeat) !== currentSeatNo && !error && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Moving from seat <strong className="text-foreground">{currentSeatNo}</strong> to
                  seat <strong className="text-foreground">{selectedSeat}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setError(null)
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangeSeat}
            disabled={isPending || !selectedSeat || selectedSeat === currentSeatNo.toString() || fetching}
            className="min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Change Seat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

