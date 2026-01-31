'use client'

import { useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createOfflineOrder } from '@/lib/admin/orders-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Route = {
  id: string
  origin: string
  destination: string
  depart_at: string
  price_cents: number
  currency: string
  capacity_online: number
}

type Props = {
  /** When set (e.g. [locale]/admin), revalidate/redirect use /[locale]/admin; omit for (admin) */
  locale?: string
  routes: Route[]
}

export default function CreateOfflineOrderForm({ locale, routes }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('1')
  const submittingRef = useRef(false)

  const selectedRoute = routes.find((r) => r.id === selectedRouteId)
  const totalAmount = selectedRoute
    ? (selectedRoute.price_cents / 100) * (parseInt(quantity) || 1)
    : 0

  async function handleSubmit(formData: FormData) {
    if (submittingRef.current) return
    submittingRef.current = true
    setError(null)
    flushSync(() => setLoading(true))

    try {
      await createOfflineOrder(formData, locale ?? undefined)
      // Redirect happens in the action
    } catch (err) {
      // Next.js redirect() throws a NEXT_REDIRECT error - ignore it
      if (err && typeof err === 'object' && 'digest' in err) {
        const redirectError = err as { digest?: string }
        if (redirectError.digest?.startsWith('NEXT_REDIRECT')) {
          return
        }
      }
      setError(err instanceof Error ? err.message : 'Failed to create order')
      setLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Offline Order</CardTitle>
        <CardDescription>
          Create an order for bookings made offline (phone, in-person, etc.)
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="route_id">Route *</Label>
            <Select
              value={selectedRouteId}
              onValueChange={setSelectedRouteId}
              disabled={loading}
              required
            >
              <SelectTrigger id="route_id" className="w-full">
                <SelectValue placeholder="Select a route..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {routes && routes.length > 0 ? (
                  routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {route.origin} → {route.destination}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(route.depart_at).toLocaleString('ro-RO', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}{' '}
                          • {route.price_cents / 100} {route.currency}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    {routes && routes.length === 0
                      ? 'No active routes available. Create a route first.'
                      : 'Loading routes...'}
                  </div>
                )}
              </SelectContent>
            </Select>
            <input type="hidden" name="route_id" value={selectedRouteId} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="h-9 flex items-center text-lg font-semibold">
                {totalAmount.toFixed(2)} {selectedRoute?.currency || 'RON'}
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+40 123 456 789"
                required
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button type="submit" disabled={loading || !selectedRouteId}>
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/orders')}
            disabled={loading}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
