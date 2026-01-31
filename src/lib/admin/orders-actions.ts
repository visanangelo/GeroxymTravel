'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { parseCreateOfflineOrderFormData } from '@/lib/schemas'

/**
 * Creează o comandă offline (admin). Partajat între /admin și /[locale]/admin.
 * Folosește service client pentru insert deoarece RLS pe orders cere customer_id sau user_id;
 * comenzile offline au ambele null.
 * @param locale - dacă e setat, revalidate/redirect folosesc /[locale]/admin; altfel /admin
 */
export async function createOfflineOrder(
  formData: FormData,
  locale?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  let routeId: string
  let quantity: number
  let customerName: string
  let phone: string
  try {
    const parsed = parseCreateOfflineOrderFormData(formData)
    routeId = parsed.route_id
    quantity = parsed.quantity
    customerName = parsed.customer_name
    phone = parsed.phone
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Date invalide'
    throw new Error(msg)
  }

  const service = createServiceClient()

  const { data: route, error: routeError } = await service
    .from('routes')
    .select('price_cents, currency, capacity_online')
    .eq('id', routeId)
    .single()

  if (routeError || !route) {
    throw new Error('Route not found')
  }

  const amountCents = route.price_cents * quantity
  const stripeSessionId = `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const { data: order, error: orderError } = await service
    .from('orders')
    .insert({
      route_id: routeId,
      user_id: null,
      quantity,
      amount_cents: amountCents,
      currency: route.currency,
      status: 'paid_offline',
      source: 'offline',
      metadata: {
        customer_name: customerName,
        phone: phone,
      },
      stripe_session_id: stripeSessionId,
      stripe_payment_intent_id: null,
    })
    .select()
    .single()

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`)
  }

  const { data: assignedTickets } = await service
    .from('tickets')
    .select('seat_no')
    .eq('route_id', routeId)
    .eq('status', 'paid')

  const assignedSeatNos = new Set(assignedTickets?.map((t) => t.seat_no) || [])

  const { data: offlineSeats } = await service
    .from('route_seats')
    .select('seat_no')
    .eq('route_id', routeId)
    .eq('pool', 'offline')

  const availableOfflineSeats =
    offlineSeats?.filter((s) => !assignedSeatNos.has(s.seat_no)) || []

  const shuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  let seatsToAssign = shuffle(availableOfflineSeats).slice(0, quantity)
  let remaining = quantity - seatsToAssign.length

  if (remaining > 0) {
    const { data: onlineSeats } = await service
      .from('route_seats')
      .select('seat_no')
      .eq('route_id', routeId)
      .eq('pool', 'online')

    const availableOnlineSeats =
      onlineSeats?.filter((s) => !assignedSeatNos.has(s.seat_no)) || []
    const randomOnlineSeats = shuffle(availableOnlineSeats).slice(0, remaining)
    seatsToAssign = [...seatsToAssign, ...randomOnlineSeats]
    remaining = quantity - seatsToAssign.length
  }

  if (seatsToAssign.length < quantity) {
    throw new Error(
      `Not enough available seats. Only ${seatsToAssign.length} seats available, but ${quantity} requested.`
    )
  }

  const tickets = seatsToAssign.map((seat) => ({
    route_id: routeId,
    order_id: order.id,
    seat_no: seat.seat_no,
    status: 'paid' as const,
  }))

  const { error: ticketsError } = await service
    .from('tickets')
    .insert(tickets)

  if (ticketsError) {
    throw new Error(`Failed to create tickets: ${ticketsError.message}`)
  }

  const base = locale ? `/${locale}/admin` : '/admin'
  revalidatePath(`${base}/orders`)
  redirect(locale ? `${base}/orders` : `${base}/orders?toast=order_created`)
}
