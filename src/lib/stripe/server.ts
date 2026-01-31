import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY. Set it in .env.local for online payments.')
  }
  return new Stripe(STRIPE_SECRET_KEY)
}

export type OrderForCheckout = {
  id: string
  amount_cents: number
  currency: string
  quantity: number
}

/**
 * Create a Stripe Checkout Session for an existing order.
 * Caller must update order.stripe_session_id with the returned sessionId.
 */
export async function createCheckoutSessionForOrder(
  order: OrderForCheckout,
  locale: string
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe()
  const baseUrl = APP_URL.replace(/\/$/, '')
  const successUrl = `${baseUrl}/${locale}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${baseUrl}/${locale}/checkout/confirm?orderId=${order.id}`

  // Text afișat pe Stripe Checkout – poți modifica aici
  const productName = 'Bilet autocar - Geroxym Travel'
  const productDescription =
    order.quantity === 1
      ? '1 bilet'
      : `${order.quantity} bilete`

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: order.quantity,
        price_data: {
          currency: (order.currency || 'ron').toLowerCase(),
          unit_amount: Math.round(order.amount_cents / order.quantity),
          product_data: {
            name: productName,
            description: productDescription,
          },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { order_id: order.id },
    client_reference_id: order.id,
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL')
  }

  return { url: session.url, sessionId: session.id }
}
