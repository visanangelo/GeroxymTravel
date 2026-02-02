'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cancelTicket } from '@/lib/admin/tickets-actions'
import { useRouter } from 'next/navigation'
import { getSeatLabel } from '@/lib/bus-layout'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
  seatNo: number
  customerName: string
  /** When set (e.g. [locale]/admin), paths use /[locale]/admin; omit for (admin) */
  locale?: string
}

export default function CancelTicketDialog({
  open,
  onOpenChange,
  ticketId,
  seatNo,
  customerName,
  locale,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleCancelTicket = () => {
    setError(null)
    startTransition(async () => {
      try {
        await cancelTicket(ticketId, locale)
        onOpenChange(false)
        toast.success('Bilet anulat', { id: `ticket-cancelled-${ticketId}` })
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to cancel ticket'
        setError(msg)
        toast.error(msg, { id: `ticket-cancel-error-${ticketId}` })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/5">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1 space-y-1.5">
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                Cancel Ticket
              </DialogTitle>
              <DialogDescription className="text-base">
                This action cannot be undone. The seat will become available again.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground mb-3">
              Are you sure you want to cancel this ticket?
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-destructive/10">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-semibold text-foreground">{customerName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-muted-foreground">Loc</span>
                <span className="font-semibold text-foreground">{getSeatLabel(seatNo)}</span>
              </div>
            </div>
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            The seat will become available for booking again. If all tickets in the order are
            cancelled, the order status will be updated automatically.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setError(null)
            }}
            disabled={isPending}
            className="min-w-[100px]"
          >
            Keep Ticket
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelTicket}
            disabled={isPending}
            className="min-w-[130px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Cancel Ticket
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}