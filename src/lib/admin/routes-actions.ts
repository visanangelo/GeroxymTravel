'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Database } from '@/lib/supabase/database.types'

const ROUTE_IMAGES_BUCKET = 'route-images'
const ITEMS_PER_PAGE = 20
const ADMIN_ROUTES_CACHE_REVALIDATE = 10
const HOMEPAGE_POSITION_MIN = 1
const HOMEPAGE_POSITION_MAX = 6

function basePath(locale?: string) {
  return locale ? `/${locale}/admin` : '/admin'
}

function parseHomepagePosition(value: string | null): number | null {
  if (!value) return null
  const n = parseInt(value, 10)
  if (n >= HOMEPAGE_POSITION_MIN && n <= HOMEPAGE_POSITION_MAX) return n
  return null
}

type AdminRouteRow = Database['public']['Tables']['routes']['Row']

export type AdminRoutesResult = {
  routes: AdminRouteRow[]
  count: number
  error: string | null
  requestId?: string
}

async function fetchAdminRoutesUncached(filters: {
  origin?: string
  destination?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
  page?: number
}): Promise<AdminRoutesResult> {
  const serviceClient = createServiceClient()
  const { origin, destination, status, dateFrom, dateTo, sort = 'depart_at_desc', page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = serviceClient
    .from('routes')
    .select('id, origin, destination, depart_at, status, price_cents, currency, capacity_online, capacity_total, reserve_offline, image_url, created_at, homepage_position', { count: 'exact' })

  if (origin?.trim()) query = query.ilike('origin', `%${origin.trim()}%`)
  if (destination?.trim()) query = query.ilike('destination', `%${destination.trim()}%`)
  if (status && status !== 'all') query = query.eq('status', status)
  if (dateFrom) query = query.gte('depart_at', dateFrom)
  if (dateTo) query = query.lte('depart_at', dateTo)

  const sortParts = sort.split('_')
  const sortOrder = sortParts[sortParts.length - 1]
  const sortField = sortParts.slice(0, -1).join('_')
  query = query.order(sortField, { ascending: sortOrder === 'asc' })
  query = query.range(from, to)

  const { data: routes, error, count } = await query

  if (error) {
    return { routes: [], count: 0, error: error.message }
  }
  return { routes: (routes ?? []) as AdminRouteRow[], count: count ?? 0, error: null }
}

export type OccupiedPositionRow = {
  position: number
  routeId: string
  routeName: string
}

/** Fetch all homepage positions occupied (pentru dropdown "Modifică poziția") */
export async function getOccupiedHomepagePositions(): Promise<OccupiedPositionRow[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const service = createServiceClient()
  const { data } = await service
    .from('routes')
    .select('id, origin, destination, homepage_position')
    .not('homepage_position', 'is', null)

  if (!data) return []
  return (data as { id: string; origin: string; destination: string; homepage_position: number }[])
    .map((r) => ({
      position: Number(r.homepage_position),
      routeId: r.id,
      routeName: `${r.origin} → ${r.destination}`,
    }))
}

/** Fetch admin routes with filters + pagination. Cached 10s. Auth checked outside cache. */
export async function getAdminRoutes(filters: {
  origin?: string
  destination?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
  page?: number
  requestId?: string
}): Promise<AdminRoutesResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { routes: [], count: 0, error: 'Unauthorized', requestId: filters.requestId }
  }

  const { requestId, ...cacheFilters } = filters
  const key = [
    'admin-routes',
    cacheFilters.origin ?? '',
    cacheFilters.destination ?? '',
    cacheFilters.status ?? '',
    cacheFilters.dateFrom ?? '',
    cacheFilters.dateTo ?? '',
    cacheFilters.sort ?? '',
    String(cacheFilters.page ?? 1),
  ]
  const getCached = unstable_cache(
    () => fetchAdminRoutesUncached(cacheFilters),
    key,
    { revalidate: ADMIN_ROUTES_CACHE_REVALIDATE, tags: ['admin-routes'] }
  )
  const result = await getCached()
  return { ...result, requestId }
}

const MAX_IMAGE_MB = 5

export async function createRoute(formData: FormData, locale?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const origin = formData.get('origin') as string
  const destination = formData.get('destination') as string
  const departAt = formData.get('depart_at') as string
  const capacityTotal = parseInt(formData.get('capacity_total') as string)
  const reserveOffline = parseInt(formData.get('reserve_offline') as string) || 5
  const priceCents = Math.round(
    parseFloat(formData.get('price') as string) * 100
  )
  const currency = (formData.get('currency') as string) || 'RON'
  const status = (formData.get('status') as string) || 'active'
  const homepagePosition = parseHomepagePosition(formData.get('homepage_position') as string | null)
  const description = (formData.get('description') as string) || null
  const imageFile = formData.get('image') as File | null
  const routeCategory = (formData.get('route_category') as string) || null
  const routeSubcategory = (formData.get('route_subcategory') as string) || null

  const capacityOnline = capacityTotal - reserveOffline

  if (capacityOnline <= 0) {
    throw new Error('Capacity online must be greater than 0. Total capacity must exceed reserved offline seats.')
  }

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0 && imageFile.type.startsWith('image/')) {
    if (imageFile.size > MAX_IMAGE_MB * 1024 * 1024) {
      throw new Error(`Image must be under ${MAX_IMAGE_MB}MB`)
    }
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const serviceClient = createServiceClient()
    const { error: uploadError } = await serviceClient.storage
      .from(ROUTE_IMAGES_BUCKET)
      .upload(path, imageFile, { upsert: false, contentType: imageFile.type })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}. Ensure bucket "${ROUTE_IMAGES_BUCKET}" exists in Supabase Storage.`)
    }

    const { data: urlData } = serviceClient.storage
      .from(ROUTE_IMAGES_BUCKET)
      .getPublicUrl(path)
    imageUrl = urlData.publicUrl
  }

  if (homepagePosition !== null) {
    await supabase
      .from('routes')
      .update({ homepage_position: null })
      .eq('homepage_position', homepagePosition)
  }

  const { data, error } = await supabase
    .from('routes')
    .insert({
      origin,
      destination,
      depart_at: departAt,
      capacity_total: capacityTotal,
      reserve_offline: reserveOffline,
      price_cents: priceCents,
      currency,
      status: status as 'active' | 'cancelled' | 'draft',
      image_url: imageUrl,
      description: description || null,
      homepage_position: homepagePosition,
      route_category: routeCategory || null,
      route_subcategory: routeSubcategory || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create route: ${error.message}`)
  }

  const base = basePath(locale)
  revalidatePath(`${base}/routes`)
  revalidateTag('admin-routes', 'max')
  revalidateTag('routes-filtered', 'max')
  revalidateTag('dashboard-stats', 'max')
  revalidateTag('dashboard-routes', 'max')
  revalidateTag('homepage-popular-routes', 'max')
  redirect(locale ? `${base}/routes` : `${base}/routes?toast=created`)
}

export async function updateRoute(
  routeId: string,
  formData: FormData,
  locale?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const origin = formData.get('origin') as string
  const destination = formData.get('destination') as string
  const departAt = formData.get('depart_at') as string
  const priceCents = Math.round(
    parseFloat(formData.get('price') as string) * 100
  )
  const currency = (formData.get('currency') as string) || 'RON'
  const status = formData.get('status') as string
  const reserveOffline = formData.get('reserve_offline')
    ? parseInt(formData.get('reserve_offline') as string)
    : undefined
  const homepagePosition = parseHomepagePosition(formData.get('homepage_position') as string | null)
  const description = (formData.get('description') as string) || null
  const imageFile = formData.get('image') as File | null
  const removeImage = formData.get('remove_image') === '1'
  const routeCategory = (formData.get('route_category') as string) || null
  const routeSubcategory = (formData.get('route_subcategory') as string) || null

  const { data: currentRoute } = await supabase
    .from('routes')
    .select('capacity_total, reserve_offline, image_url')
    .eq('id', routeId)
    .single()

  const updateData: Record<string, unknown> = {
    origin,
    destination,
    depart_at: departAt,
    price_cents: priceCents,
    currency,
    status: status as 'active' | 'cancelled' | 'draft',
    description: description || null,
    homepage_position: homepagePosition,
    route_category: routeCategory || null,
    route_subcategory: routeSubcategory || null,
  }

  if (homepagePosition !== null) {
    await supabase
      .from('routes')
      .update({ homepage_position: null })
      .eq('homepage_position', homepagePosition)
      .neq('id', routeId)
  }

  if (reserveOffline !== undefined) {
    updateData.reserve_offline = reserveOffline
  }

  let imageUrl: string | null | undefined = undefined
  if (removeImage) {
    imageUrl = null
  } else if (imageFile && imageFile.size > 0 && imageFile.type.startsWith('image/')) {
    if (imageFile.size > MAX_IMAGE_MB * 1024 * 1024) {
      throw new Error(`Image must be under ${MAX_IMAGE_MB}MB`)
    }
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${routeId}-${Date.now()}.${ext}`
    const serviceClient = createServiceClient()
    const { error: uploadError } = await serviceClient.storage
      .from(ROUTE_IMAGES_BUCKET)
      .upload(path, imageFile, { upsert: true, contentType: imageFile.type })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    const { data: urlData } = serviceClient.storage
      .from(ROUTE_IMAGES_BUCKET)
      .getPublicUrl(path)
    imageUrl = urlData.publicUrl
  }

  if (imageUrl !== undefined) {
    updateData.image_url = imageUrl
  }

  const { data, error } = await supabase
    .from('routes')
    .update(updateData)
    .eq('id', routeId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update route: ${error.message}`)
  }

  if (
    reserveOffline !== undefined &&
    currentRoute &&
    reserveOffline !== currentRoute.reserve_offline
  ) {
    await rebalanceSeats(routeId, currentRoute.capacity_total, reserveOffline)
  }

  const base = basePath(locale)
  revalidatePath(`${base}/routes`)
  revalidatePath(`${base}/routes/${routeId}`)
  revalidateTag('admin-routes', 'max')
  revalidateTag('routes-filtered', 'max')
  revalidateTag('dashboard-stats', 'max')
  revalidateTag('dashboard-routes', 'max')
  revalidateTag('homepage-popular-routes', 'max')
  redirect(locale ? `${base}/routes/${routeId}` : `${base}/routes?toast=updated`)
}

export async function rebalanceSeats(
  routeId: string,
  capacityTotal: number,
  newReserveOffline: number
) {
  const supabase = await createClient()

  const newCapacityOnline = capacityTotal - newReserveOffline
  const oldReserveOffline = capacityTotal - newCapacityOnline

  if (newReserveOffline === oldReserveOffline) {
    return
  }

  const { data: seats } = await supabase
    .from('route_seats')
    .select('seat_no, pool')
    .eq('route_id', routeId)
    .order('seat_no', { ascending: false })

  if (!seats) return

  const { data: tickets } = await supabase
    .from('tickets')
    .select('seat_no')
    .eq('route_id', routeId)
    .eq('status', 'paid')

  const assignedSeatNos = new Set(tickets?.map((t) => t.seat_no) || [])

  const offlineStartSeatNo = newCapacityOnline + 1
  const offlineSeatNos = new Set<number>()
  for (let i = offlineStartSeatNo; i <= capacityTotal; i++) {
    offlineSeatNos.add(i)
  }

  const updates = seats
    .filter((seat) => !assignedSeatNos.has(seat.seat_no))
    .map((seat) => {
      const shouldBeOffline = offlineSeatNos.has(seat.seat_no)
      if (seat.pool === 'online' && shouldBeOffline) {
        return supabase
          .from('route_seats')
          .update({ pool: 'offline' })
          .eq('route_id', routeId)
          .eq('seat_no', seat.seat_no)
      } else if (seat.pool === 'offline' && !shouldBeOffline) {
        return supabase
          .from('route_seats')
          .update({ pool: 'online' })
          .eq('route_id', routeId)
          .eq('seat_no', seat.seat_no)
      }
      return null
    })
    .filter(Boolean)

  await Promise.all(updates)
}

export async function cancelRoute(routeId: string, locale?: string): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('routes')
    .update({ status: 'cancelled' })
    .eq('id', routeId)

  if (error) {
    return { success: false as const, error: error.message }
  }

  const base = basePath(locale)
  revalidatePath(`${base}/routes`)
  revalidateTag('admin-routes', 'max')
  revalidateTag('routes-filtered', 'max')
  revalidateTag('dashboard-stats', 'max')
  revalidateTag('dashboard-routes', 'max')
  revalidateTag('homepage-popular-routes', 'max')
  return { success: true as const }
}

/** Set route homepage position (1-6 or null). If target position is taken, swap with that route. */
export async function setRouteHomepagePosition(
  routeId: string,
  position: number | null,
  locale?: string
): Promise<{ success: true; position: number | null } | { success: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  if (position !== null && (position < HOMEPAGE_POSITION_MIN || position > HOMEPAGE_POSITION_MAX)) {
    return { success: false, error: 'Poziția trebuie să fie între 1 și 6' }
  }

  const { data: current } = await supabase
    .from('routes')
    .select('homepage_position')
    .eq('id', routeId)
    .single()

  const oldPosition: number | null = (current?.homepage_position ?? null) as number | null

  if (position !== null) {
    const { data: occupant } = await supabase
      .from('routes')
      .select('id')
      .eq('homepage_position', position)
      .neq('id', routeId)
      .maybeSingle()

    if (occupant?.id) {
      const { error: swapError } = await supabase
        .from('routes')
        .update({ homepage_position: oldPosition })
        .eq('id', occupant.id)
      if (swapError) return { success: false, error: swapError.message }
    }
  }

  const { error: updateError } = await supabase
    .from('routes')
    .update({ homepage_position: position })
    .eq('id', routeId)

  if (updateError) return { success: false, error: updateError.message }

  const base = basePath(locale)
  revalidatePath(`${base}/routes`)
  revalidateTag('admin-routes', 'max')
  revalidateTag('homepage-popular-routes', 'max')
  return { success: true as const, position }
}

/** Delete route and related data (tickets, orders, route_seats). Call from client/form only. */
export async function deleteRoute(routeId: string, locale?: string): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const service = createServiceClient()
  const { error: ticketsError } = await service.from('tickets').delete().eq('route_id', routeId)
  if (ticketsError) return { success: false, error: ticketsError.message }
  const { error: ordersError } = await service.from('orders').delete().eq('route_id', routeId)
  if (ordersError) return { success: false, error: ordersError.message }
  const { error: seatsError } = await service.from('route_seats').delete().eq('route_id', routeId)
  if (seatsError) return { success: false, error: seatsError.message }
  const { error: routeError } = await service.from('routes').delete().eq('id', routeId)
  if (routeError) return { success: false as const, error: routeError.message }

  const base = basePath(locale)
  revalidatePath(`${base}/routes`)
  revalidateTag('admin-routes', 'max')
  revalidateTag('routes-filtered', 'max')
  revalidateTag('dashboard-stats', 'max')
  revalidateTag('dashboard-routes', 'max')
  revalidateTag('homepage-popular-routes', 'max')
  return { success: true as const }
}
