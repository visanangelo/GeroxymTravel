'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

const TicketActionsDropdown = dynamic(
  () => import('@/components/admin/TicketActionsDropdown'),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
        <span className="sr-only">Loading</span>
        <MoreHorizontal className="h-4 w-4 animate-pulse text-muted-foreground" />
      </Button>
    ),
  }
)

type Props = {
  /** When set (e.g. [locale]/admin), paths use /[locale]/admin; omit for (admin) */
  locale?: string
  ticketId: string
  routeId: string
  seatNo: number
  status: 'paid' | 'cancelled'
  customerName: string
}

export default function TicketActionsCell({
  locale,
  ticketId,
  routeId,
  seatNo,
  status,
  customerName,
}: Props) {
  return (
    <TicketActionsDropdown
      locale={locale}
      ticketId={ticketId}
      routeId={routeId}
      seatNo={seatNo}
      status={status}
      customerName={customerName}
    />
  )
}
