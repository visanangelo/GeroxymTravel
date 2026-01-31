'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrderWithGuest } from '@/app/[locale]/routes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { User, Mail, Phone, Check } from 'lucide-react'
import Link from 'next/link'

type Props = {
  locale: string
  routeId: string
  priceCents: number
  currency: string
  maxQuantity: number
  customerData?: {
    full_name: string
    email: string
    phone: string
  } | null
}

export default function RouteBookingForm({
  locale,
  routeId,
  priceCents,
  currency,
  maxQuantity,
  customerData,
}: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState<string>('1')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'quantity' | 'customer'>('quantity')

  const qty = parseInt(quantity) || 1
  const totalAmount = priceCents * qty
  const isLoggedIn = !!customerData

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (step === 'quantity') {
        // If logged in, skip customer step and create order directly
        if (isLoggedIn && customerData) {
          const orderId = await createOrderWithGuest(
            routeId,
            qty,
            customerData.full_name,
            customerData.email,
            customerData.phone,
            locale
          )
          router.push(`/${locale}/checkout/confirm?orderId=${orderId}`)
          return
        }
        // Guest user - show customer info form
        setStep('customer')
        setLoading(false)
        return
      }

      // Step 2: Guest checkout - create order with entered info
      const orderId = await createOrderWithGuest(
        routeId,
        qty,
        fullName,
        email,
        phone,
        locale
      )
      router.push(`/${locale}/checkout/confirm?orderId=${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
      setLoading(false)
    }
  }

  if (step === 'customer') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Customer Information</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep('quantity')}
          >
            Back
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalAmount / 100, currency)}
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLoggedIn && customerData && (
        <div className="rounded-lg bg-primary/10 p-4 border border-primary/20 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Check className="h-4 w-4" />
            Using your account information
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{customerData.full_name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{customerData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{customerData.phone}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t border-primary/20">
            You can update your information in{' '}
            <Link href={`/${locale}/account/settings`} className="text-primary hover:underline">
              Account Settings
            </Link>
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Number of Tickets</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Maximum {maxQuantity} tickets available
          </p>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalAmount / 100, currency)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || qty < 1 || qty > maxQuantity}
      >
        {loading ? 'Processing...' : isLoggedIn ? 'Continue to Payment' : 'Continue'}
      </Button>
    </form>
  )
}
