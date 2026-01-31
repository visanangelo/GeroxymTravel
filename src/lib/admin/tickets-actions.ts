'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']

function basePath(locale?: string) {
  return locale ? `/${locale}/admin` : '/admin'
}

export async function cancelTicket(ticketId: string, locale?: string): Promise<Ticket> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    throw new Error('Ticket not found')
  }

  if (ticket.status !== 'paid') {
    throw new Error(`Cannot cancel ticket with status: ${ticket.status}`)
  }

  const { data: updatedTicket, error: updateError } = await supabase
    .from('tickets')
    .update({ status: 'cancelled' })
    .eq('id', ticketId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to cancel ticket: ${updateError.message}`)
  }

  const { data: orderTickets } = await supabase
    .from('tickets')
    .select('status')
    .eq('order_id', ticket.order_id)

  const allCancelled = orderTickets?.every((t) => t.status === 'cancelled')

  if (allCancelled) {
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', ticket.order_id)
  }

  const base = basePath(locale)
  revalidatePath(`${base}/tickets`)
  revalidatePath(`${base}/orders`)
  revalidatePath(`${base}/routes/${ticket.route_id}`)

  return updatedTicket
}

export async function changeSeat(
  ticketId: string,
  newSeatNo: number,
  locale?: string
): Promise<Ticket> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    throw new Error('Ticket not found')
  }

  if (ticket.status !== 'paid') {
    throw new Error(`Cannot change seat for ticket with status: ${ticket.status}`)
  }

  const { data: routeSeat, error: seatError } = await supabase
    .from('route_seats')
    .select('seat_no, pool')
    .eq('route_id', ticket.route_id)
    .eq('seat_no', newSeatNo)
    .single()

  if (seatError || !routeSeat) {
    throw new Error(`Seat ${newSeatNo} does not exist for this route`)
  }

  const { data: existingTicket } = await supabase
    .from('tickets')
    .select('id')
    .eq('route_id', ticket.route_id)
    .eq('seat_no', newSeatNo)
    .eq('status', 'paid')
    .neq('id', ticketId)
    .single()

  if (existingTicket) {
    throw new Error(`Seat ${newSeatNo} is already occupied`)
  }

  const { data: updatedTicket, error: updateError } = await supabase
    .from('tickets')
    .update({ seat_no: newSeatNo })
    .eq('id', ticketId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to change seat: ${updateError.message}`)
  }

  const base = basePath(locale)
  revalidatePath(`${base}/tickets`)
  revalidatePath(`${base}/routes/${ticket.route_id}`)

  return updatedTicket
}

export async function reactivateTicket(ticketId: string, locale?: string): Promise<Ticket> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    throw new Error('Ticket not found')
  }

  if (ticket.status !== 'cancelled') {
    throw new Error(`Cannot reactivate ticket with status: ${ticket.status}`)
  }

  const { data: existingTicket } = await supabase
    .from('tickets')
    .select('id')
    .eq('route_id', ticket.route_id)
    .eq('seat_no', ticket.seat_no)
    .eq('status', 'paid')
    .neq('id', ticketId)
    .single()

  if (existingTicket) {
    throw new Error(`Seat ${ticket.seat_no} is now occupied. Cannot reactivate.`)
  }

  const { data: updatedTicket, error: updateError } = await supabase
    .from('tickets')
    .update({ status: 'paid' })
    .eq('id', ticketId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to reactivate ticket: ${updateError.message}`)
  }

  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', ticket.order_id)
    .single()

  if (order && order.status === 'cancelled') {
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', ticket.order_id)
  }

  const base = basePath(locale)
  revalidatePath(`${base}/tickets`)
  revalidatePath(`${base}/orders`)
  revalidatePath(`${base}/routes/${ticket.route_id}`)

  return updatedTicket
}
