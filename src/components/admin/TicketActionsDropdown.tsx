'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, ArrowLeftRight, X, RotateCcw } from 'lucide-react'

// Lazy load heavy dialog components (only load when needed)
const ChangeSeatDialog = dynamic(() => import('./ChangeSeatDialog'), {
  ssr: false,
})
const CancelTicketDialog = dynamic(() => import('./CancelTicketDialog'), {
  ssr: false,
})

type Props = {
  /** When set (e.g. [locale]/admin), paths use /[locale]/admin; omit for (admin) */
  locale?: string
  ticketId: string
  routeId: string
  seatNo: number
  status: 'paid' | 'cancelled'
  customerName: string
}

export default function TicketActionsDropdown({
  locale,
  ticketId,
  routeId,
  seatNo,
  status,
  customerName,
}: Props) {
  const [changeSeatOpen, setChangeSeatOpen] = useState(false)
  const [cancelTicketOpen, setCancelTicketOpen] = useState(false)

  const isPaid = status === 'paid'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/tickets/${ticketId}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/routes/${routeId}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Route
            </Link>
          </DropdownMenuItem>
          {isPaid && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setChangeSeatOpen(true)}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Change Seat
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setCancelTicketOpen(true)}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Ticket
              </DropdownMenuItem>
            </>
          )}
          {!isPaid && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Reactivate would go here if implemented
                }}
                disabled
                className="text-muted-foreground"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivate (Coming Soon)
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isPaid && (
        <>
          <ChangeSeatDialog
            open={changeSeatOpen}
            onOpenChange={setChangeSeatOpen}
            ticketId={ticketId}
            routeId={routeId}
            currentSeatNo={seatNo}
            locale={locale}
          />
          <CancelTicketDialog
            open={cancelTicketOpen}
            onOpenChange={setCancelTicketOpen}
            ticketId={ticketId}
            seatNo={seatNo}
            customerName={customerName}
            locale={locale}
          />
        </>
      )}
    </>
  )
}

