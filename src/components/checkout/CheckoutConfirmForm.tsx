'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckoutSession, finalizeOrder } from '@/app/[locale]/checkout/[orderId]/actions'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react'

type Props = {
  locale: string
  orderId: string
}

export default function CheckoutConfirmForm({ locale, orderId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    setError(null)
    setLoading(true)

    try {
      const { url } = await createCheckoutSession(orderId, locale)
      if (url) {
        window.location.href = url
        return
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('STRIPE_SECRET_KEY') || msg.includes('Missing')) {
        try {
          const result = await finalizeOrder(orderId)
          if (result.success) {
            router.push(`/${locale}/checkout/success?orderId=${orderId}`)
            return
          }
        } catch (finalizeErr) {
          setError(finalizeErr instanceof Error ? finalizeErr.message : 'Failed to confirm booking')
        }
      } else {
        setError(msg || 'Failed to start payment')
      }
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Redirecting to payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay with Card (Stripe)
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        You will be redirected to Stripe Checkout to complete payment securely.
      </p>
    </div>
  )
}

