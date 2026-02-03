'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { parseFinalizeOrderOrderId } from '@/lib/schemas'
import { finalizeOrderLogic } from '@/lib/checkout/finalize-order-logic'
import { createCheckoutSessionForOrder } from '@/lib/stripe/server'

export async function finalizeOrder(orderId: string) {
  const perfStart = Date.now()

  let validOrderId: string
  try {
    validOrderId = parseFinalizeOrderOrderId(orderId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ID comandă invalid'
    throw new Error(msg)
  }

  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: order, error: orderFetchError } = await serviceClient
    .from('orders')
    .select('id, status, customer_id, user_id')
    .eq('id', validOrderId)
    .single()

  if (orderFetchError || !order) {
    throw new Error('Order not found')
  }

  if (order.status !== 'created') {
    throw new Error(`Cannot finalize order with status: ${order.status}`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (order.user_id) {
    if (!user || order.user_id !== user.id) {
      throw new Error('Order does not belong to current user')
    }
  } else if (order.customer_id && user) {
    const { data: customer } = await serviceClient
      .from('customers')
      .select('user_id')
      .eq('id', order.customer_id)
      .single()

    if (customer?.user_id && customer.user_id !== user.id) {
      throw new Error('Order does not belong to current user')
    }
  }

  const result = await finalizeOrderLogic(validOrderId)

  if (process.env.NODE_ENV === 'development') {
    console.log(`[perf] finalizeOrder ${validOrderId} took ${Date.now() - perfStart}ms`)
  }

  return {
    success: result.success,
    seatNumbers: result.seatNumbers,
  }
}

/**
 * Create Stripe Checkout Session for an order and return the redirect URL.
 * Updates order.stripe_session_id. Caller should redirect user to the returned url.
 * Verifies availability before creating session – if seats were sold in the meantime, no redirect to Pay.
 */
export async function createCheckoutSession(orderId: string, locale: string): Promise<{ url: string }> {
  const validOrderId = parseFinalizeOrderOrderId(orderId)
  const serviceClient = createServiceClient()

  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, route_id, amount_cents, currency, quantity, status')
    .eq('id', validOrderId)
    .single()

  if (orderError || !order) {
    throw new Error('Order not found')
  }

  if (order.status !== 'created') {
    throw new Error(`Cannot pay for order with status: ${order.status}`)
  }

  // Check availability now – don't send to Stripe if seats were sold in the meantime
  const { data: route } = await serviceClient
    .from('routes')
    .select('capacity_online, reserve_offline')
    .eq('id', order.route_id)
    .single()

  if (route) {
    const { data: tickets } = await serviceClient
      .from('tickets')
      .select('seat_no')
      .eq('route_id', order.route_id)
      .eq('status', 'paid')
    const assignedSeatNos = new Set((tickets ?? []).map((t: { seat_no: number }) => t.seat_no))
    const reserveOffline = route.reserve_offline ?? 4
    const onlineSold = Array.from(assignedSeatNos).filter((seatNo) => seatNo > reserveOffline).length
    const onlineRemaining = route.capacity_online - onlineSold

    if (order.quantity > onlineRemaining) {
      throw new Error(
        onlineRemaining <= 0
          ? 'Nu mai sunt locuri disponibile pentru această cursă. Comanda nu poate fi plătită.'
          : `Mai sunt doar ${onlineRemaining} locuri. Comanda ta este pentru ${order.quantity} – nu poți plăti acum. Alege o altă cursă sau cantitate.`
      )
    }
  }

  const { url, sessionId } = await createCheckoutSessionForOrder(
    {
      id: order.id,
      amount_cents: order.amount_cents,
      currency: order.currency,
      quantity: order.quantity,
    },
    locale
  )

  const { error: updateError } = await serviceClient
    .from('orders')
    .update({ stripe_session_id: sessionId })
    .eq('id', validOrderId)

  if (updateError) {
    throw new Error(`Failed to save checkout session: ${updateError.message}`)
  }

  return { url }
}
