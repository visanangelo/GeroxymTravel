import { createClient } from '@/lib/supabase/server'
import CreateOfflineOrderForm from '@/components/admin/CreateOfflineOrderForm'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<Record<string, never>>
}

export default async function CreateOfflineOrderPage({ params }: Props) {
  await params // Admin routes don't have params, but we await for consistency
  const supabase = await createClient()

  // Fetch active routes (don't filter by depart_at - admin might want to create orders for past routes too)
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select('id, origin, destination, depart_at, price_cents, currency, capacity_online')
    .eq('status', 'active')
    .order('depart_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Offline Order</h1>
        <p className="text-muted-foreground">
          Create an order for offline/phone bookings
        </p>
      </div>
      <div className="max-w-2xl">
        {routesError && (
          <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            Error loading routes: {routesError.message}
          </div>
        )}
        <CreateOfflineOrderForm routes={routes || []} />
      </div>
    </div>
  )
}
