import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

const HOMEPAGE_ROUTES_LIMIT = 6
const HOMEPAGE_CACHE_REVALIDATE = 300 // 5 minutes – no request on every refresh

export type HomepageRoute = {
  id: string
  origin: string
  destination: string
  price_cents: number
  currency: string
  image_url: string | null
}

async function fetchHomepagePopularRoutesUncached(): Promise<HomepageRoute[]> {
  const service = createServiceClient()
  const now = new Date().toISOString()

  const { data, error } = await service
    .from('routes')
    .select('id, origin, destination, price_cents, currency, image_url')
    .eq('status', 'active')
    .not('homepage_position', 'is', null)
    .gte('depart_at', now)
    .order('homepage_position', { ascending: true })
    .limit(HOMEPAGE_ROUTES_LIMIT)

  if (error) return []
  return (data ?? []) as HomepageRoute[]
}

/**
 * Up to 6 active routes for the homepage. Cached 5 min – no DB hit on every page load.
 * Revalidated when admin creates/updates/deletes/cancels a route.
 */
export function getHomepagePopularRoutes(): Promise<HomepageRoute[]> {
  return unstable_cache(
    fetchHomepagePopularRoutesUncached,
    ['homepage-popular-routes'],
    { revalidate: HOMEPAGE_CACHE_REVALIDATE, tags: ['homepage-popular-routes'] }
  )()
}
