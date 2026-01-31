import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/server'
import { finalizeOrderLogic } from '@/lib/checkout/finalize-order-logic'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] Stripe signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id || session.client_reference_id

    if (!orderId) {
      console.error('[webhook] checkout.session.completed: no order_id in metadata')
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    try {
      await finalizeOrderLogic(orderId)
      return NextResponse.json({ received: true })
    } catch (err) {
      console.error('[webhook] finalizeOrderLogic failed:', err)
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Finalize failed' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
