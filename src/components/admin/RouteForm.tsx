'use client'

import { useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { createRoute } from '@/lib/admin/routes-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RouteImageUpload } from '@/components/admin/RouteImageUpload'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor').then((m) => ({ default: m.RichTextEditor })), {
  ssr: false,
  loading: () => (
    <div className="min-h-[120px] rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
      Se încarcă editorul...
    </div>
  ),
})

type Props = {
  /** When set (e.g. [locale]/admin), paths use /[locale]/admin; omit for (admin) */
  locale?: string
}

const HOMEPAGE_POSITION_OPTIONS = [
  { value: '', label: 'Nu (nu apare pe homepage)' },
  { value: '1', label: 'Poziția 1' },
  { value: '2', label: 'Poziția 2' },
  { value: '3', label: 'Poziția 3' },
  { value: '4', label: 'Poziția 4' },
  { value: '5', label: 'Poziția 5' },
  { value: '6', label: 'Poziția 6' },
]

const ROUTE_CATEGORY_OPTIONS = [
  { value: '', label: 'Niciuna' },
  { value: 'intern', label: 'Interne' },
  { value: 'extern', label: 'Externe' },
  { value: 'pelerinaj', label: 'Pelerinaje' },
  { value: 'sejur_mare', label: 'Sejur la mare' },
]

const SEJUR_SUBCATEGORY_OPTIONS = [
  { value: '', label: '—' },
  { value: 'grecia', label: 'Grecia' },
  { value: 'turcia', label: 'Turcia' },
  { value: 'albania', label: 'Albania' },
  { value: 'bulgaria', label: 'Bulgaria' },
]

export default function RouteForm({ locale }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [homepagePosition, setHomepagePosition] = useState('')
  const [routeCategory, setRouteCategory] = useState('')
  const [routeSubcategory, setRouteSubcategory] = useState('')
  const submittingRef = useRef(false)

  async function handleSubmit(formData: FormData) {
    if (submittingRef.current) return
    submittingRef.current = true
    setError(null)
    flushSync(() => setLoading(true))

    try {
      await createRoute(formData, locale)
      // Redirect happens in the action (redirect() throws NEXT_REDIRECT error)
    } catch (err) {
      // Next.js redirect() throws a NEXT_REDIRECT error - ignore it
      if (err && typeof err === 'object' && 'digest' in err) {
        const redirectError = err as { digest?: string }
        if (redirectError.digest?.startsWith('NEXT_REDIRECT')) {
          // This is a redirect, not a real error - let it happen
          return
        }
      }
      setError(err instanceof Error ? err.message : 'Failed to create route')
      setLoading(false)
      submittingRef.current = false
    }
  }

  // Get current date/time in local timezone for datetime-local input
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Route</CardTitle>
        <CardDescription>Add a new route for ticket sales</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin *</Label>
              <Input
                id="origin"
                name="origin"
                placeholder="București"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="Brașov"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="depart_at">Departure Date & Time *</Label>
            <Input
              id="depart_at"
              name="depart_at"
              type="datetime-local"
              min={minDateTime}
              required
              disabled={loading}
            />
          </div>
          <input type="hidden" name="capacity_total" value="51" />
          <input type="hidden" name="reserve_offline" value="4" />
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Autocar: 51 locuri (4 rezervate offline – primul rând).
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (RON) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="89.00"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue="RON"
                placeholder="RON"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue="active"
              disabled={loading}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
            <Label htmlFor="homepage_position">Poziție pe homepage (Rute Populare)</Label>
            <select
              id="homepage_position"
              name="homepage_position"
              value={homepagePosition}
              onChange={(e) => setHomepagePosition(e.target.value)}
              disabled={loading}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {HOMEPAGE_POSITION_OPTIONS.map((opt) => (
                <option key={opt.value || 'nu'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="route_category">Categorie circuit</Label>
              <select
                id="route_category"
                name="route_category"
                value={routeCategory}
                onChange={(e) => {
                  setRouteCategory(e.target.value)
                  if (e.target.value !== 'sejur_mare') setRouteSubcategory('')
                }}
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ROUTE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'none'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {routeCategory === 'sejur_mare' && (
              <div className="space-y-2">
                <Label htmlFor="route_subcategory">Destinație sejur la mare</Label>
                <select
                  id="route_subcategory"
                  name="route_subcategory"
                  value={routeSubcategory}
                  onChange={(e) => setRouteSubcategory(e.target.value)}
                  disabled={loading}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SEJUR_SUBCATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value || 'none'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <RouteImageUpload name="image" disabled={loading} />
          <div className="space-y-2">
            <Label>Description (rich text)</Label>
            <RichTextEditor
              name="description"
              disabled={loading}
              minHeight="200px"
              placeholder="Describe the route, highlights, amenities..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Route'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/routes')}
            disabled={loading}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

