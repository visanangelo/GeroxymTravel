'use server'

import {
  cancelTicket as cancelTicketShared,
  changeSeat as changeSeatShared,
  reactivateTicket as reactivateTicketShared,
} from '@/lib/admin/tickets-actions'

export async function cancelTicket(ticketId: string) {
  return cancelTicketShared(ticketId, undefined)
}

export async function changeSeat(ticketId: string, newSeatNo: number) {
  return changeSeatShared(ticketId, newSeatNo, undefined)
}

export async function reactivateTicket(ticketId: string) {
  return reactivateTicketShared(ticketId, undefined)
}
