import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RouteEditForm from '@/components/admin/RouteEditForm'

type Props = {
  params: Promise<{ id: string }>
}

// Default locale for admin (no locale in URL)
const DEFAULT_LOCALE = 'ro'

export default async function RouteEditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch route
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('id', id)
    .single()

  if (routeError || !route) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Route</h1>
        <p className="text-muted-foreground">
          {route.origin} → {route.destination}
        </p>
      </div>
      <div className="max-w-2xl">
        <RouteEditForm route={route} />
      </div>
    </div>
  )
}

