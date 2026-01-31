/**
 * Client-side data prefetching for admin pages
 * Prefetches data before navigation for instant loading
 */

const CACHE_TTL = 30 * 1000 // 30 seconds
const cache = new Map<string, { data: any; timestamp: number }>()

export async function prefetchAdminData(url: string) {
  // Check cache first
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    // Prefetch data
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Use low priority to not block other requests
      priority: 'low' as any,
    })

    if (response.ok) {
      const data = await response.json()
      cache.set(url, { data, timestamp: Date.now() })
      return data
    }
  } catch (error) {
    // Silently fail - prefetch is optional
    console.debug('Prefetch failed:', error)
  }

  return null
}

export function clearAdminCache() {
  cache.clear()
}

export function getCachedData(url: string) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

