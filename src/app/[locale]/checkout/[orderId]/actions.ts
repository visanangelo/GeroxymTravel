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
 */
export async function createCheckoutSession(orderId: string, locale: string): Promise<{ url: string }> {
  const validOrderId = parseFinalizeOrderOrderId(orderId)
  const serviceClient = createServiceClient()

  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, amount_cents, currency, quantity, status')
    .eq('id', validOrderId)
    .single()

  if (orderError || !order) {
    throw new Error('Order not found')
  }

  if (order.status !== 'created') {
    throw new Error(`Cannot pay for order with status: ${order.status}`)
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
