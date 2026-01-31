'use server'

import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'

export type RouteWithAvailability = {
  id: string
  origin: string
  destination: string
  depart_at: string
  price_cents: number
  currency: string
  capacity_online: number
  capacity_total: number
  status: string
  image_url: string | null
  onlineRemaining: number
  onlineSold: number
}

const ROUTES_CACHE_REVALIDATE = 10

async function fetchFilteredRoutesUncached(filters: {
  origin?: string
  destination?: string
  date?: string
}): Promise<{ routes: RouteWithAvailability[]; error: string | null }> {
  const serviceClient = createServiceClient()
  const { origin, destination, date } = filters

  let query = serviceClient
    .from('routes')
    .select('id, origin, destination, depart_at, price_cents, currency, capacity_online, capacity_total, status, image_url')
    .eq('status', 'active')
    .gte('depart_at', new Date().toISOString())
    .order('depart_at', { ascending: true })
    .limit(50)

  if (origin?.trim()) {
    query = query.ilike('origin', `%${origin.trim()}%`)
  }
  if (destination?.trim()) {
    query = query.ilike('destination', `%${destination.trim()}%`)
  }
  if (date) {
    const dateStart = new Date(date)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(date)
    dateEnd.setHours(23, 59, 59, 999)
    query = query.gte('depart_at', dateStart.toISOString()).lte('depart_at', dateEnd.toISOString())
  }

  const { data: routes, error } = await query

  if (error) {
    return { routes: [], error: error.message }
  }

  const routeIds = (routes ?? []).map((r: { id: string }) => r.id)
  if (routeIds.length === 0) {
    return { routes: [], error: null }
  }

  const { data: allTickets } = await serviceClient
    .from('tickets')
    .select('route_id, seat_no, status')
    .in('route_id', routeIds)
    .eq('status', 'paid')

  const ticketsByRoute = new Map<string, Set<number>>()
  allTickets?.forEach((ticket: { route_id: string; seat_no: number }) => {
    if (!ticketsByRoute.has(ticket.route_id)) ticketsByRoute.set(ticket.route_id, new Set())
    ticketsByRoute.get(ticket.route_id)!.add(ticket.seat_no)
  })

  const routesWithData: RouteWithAvailability[] = (routes ?? []).map((route: Record<string, unknown>) => {
    const assignedSeatNos = ticketsByRoute.get(route.id as string) ?? new Set<number>()
    const onlineSold = Array.from(assignedSeatNos).filter((seatNo) => seatNo <= (route.capacity_online as number)).length
    const onlineRemaining = Math.max(0, (route.capacity_online as number) - onlineSold)
    return {
      ...route,
      image_url: (route.image_url as string) ?? null,
      onlineRemaining,
      onlineSold,
    } as RouteWithAvailability
  })

  return { routes: routesWithData, error: null }
}

/** Fetch filtered routes + availability. Cached 10s. Supports requestId for stale-request discard. */
export async function getFilteredRoutes(
  filters: {
    origin?: string
    destination?: string
    date?: string
    requestId?: string
  }
): Promise<{ routes: RouteWithAvailability[]; error: string | null; requestId?: string }> {
  const { requestId, ...cacheFilters } = filters
  const key = ['routes-filtered', cacheFilters.origin ?? '', cacheFilters.destination ?? '', cacheFilters.date ?? '']
  const cached = await unstable_cache(
    () => fetchFilteredRoutesUncached(cacheFilters),
    key,
    { revalidate: ROUTES_CACHE_REVALIDATE, tags: ['routes-filtered'] }
  )()
  return { ...cached, requestId }
}

// Guest checkout: Create order with customer info
export async function createOrderWithGuest(
  routeId: string,
  quantity: number,
  fullName: string,
  email: string,
  phone: string,
  locale: string
) {
  const supabase = await createClient()

  // Validate quantity
  if (quantity < 1 || quantity > 10) {
    throw new Error('Quantity must be between 1 and 10')
  }

  // Validate customer info
  if (!fullName || !email || !phone) {
    throw new Error('All customer information is required')
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address')
  }

  // Get route details
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('price_cents, currency, capacity_online, status')
    .eq('id', routeId)
    .single()

  if (routeError || !route) {
    throw new Error('Route not found')
  }

  if (route.status !== 'active') {
    throw new Error('Route is not available for booking')
  }

  // Check availability
  // Use service client to read tickets (bypasses RLS for public availability info)
  const serviceClientForTickets = createServiceClient()
  const { data: tickets } = await serviceClientForTickets
    .from('tickets')
    .select('seat_no')
    .eq('route_id', routeId)
    .eq('status', 'paid')

  const assignedSeatNos = new Set(tickets?.map((t) => t.seat_no) || [])
  const onlineSold = Array.from(assignedSeatNos).filter(
    (seatNo) => seatNo <= route.capacity_online
  ).length
  const onlineRemaining = route.capacity_online - onlineSold

  if (quantity > onlineRemaining) {
    throw new Error(
      `Only ${onlineRemaining} seats available. Please select fewer tickets.`
    )
  }

  // Calculate amount
  const amountCents = route.price_cents * quantity

  // Create or find customer by email
  // Use service role client to bypass RLS for customer creation
  const serviceClient = createServiceClient()
  let customerId: string

  const { data: existingCustomer } = await serviceClient
    .from('customers')
    .select('id')
    .eq('email', email)
    .single()

  if (existingCustomer) {
    // Update existing customer info
    const { data: updatedCustomer, error: updateError } = await serviceClient
      .from('customers')
      .update({
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingCustomer.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update customer: ${updateError.message}`)
    }

    customerId = updatedCustomer.id
  } else {
    // Create new customer
    const { data: newCustomer, error: customerError } = await serviceClient
      .from('customers')
      .insert({
        full_name: fullName,
        email: email,
        phone: phone,
        user_id: null, // Guest checkout, no user_id yet
      })
      .select()
      .single()

    if (customerError) {
      throw new Error(`Failed to create customer: ${customerError.message}`)
    }

    customerId = newCustomer.id
  }

  // Get current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create order with customer_id
  // Use service client to bypass RLS for guest orders
  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .insert({
      route_id: routeId,
      customer_id: customerId,
      user_id: user?.id || null, // Optional: link to user if logged in
      quantity,
      amount_cents: amountCents,
      currency: route.currency,
      status: 'created',
      source: 'online',
      metadata: {
        customer_name: fullName,
        phone: phone,
      },
      stripe_session_id: `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      stripe_payment_intent_id: null,
    })
    .select()
    .single()

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`)
  }

  return order.id
}

// Legacy function for authenticated users (keep for backward compatibility)
export async function createOrder(
  routeId: string,
  quantity: number,
  locale: string
) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create an order')
  }

  // Validate quantity
  if (quantity < 1 || quantity > 10) {
    throw new Error('Quantity must be between 1 and 10')
  }

  // Get route details
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('price_cents, currency, capacity_online, status')
    .eq('id', routeId)
    .single()

  if (routeError || !route) {
    throw new Error('Route not found')
  }

  if (route.status !== 'active') {
    throw new Error('Route is not available for booking')
  }

  // Check availability
  // Use service client to read tickets (bypasses RLS for public availability info)
  const serviceClientForTickets = createServiceClient()
  const { data: tickets } = await serviceClientForTickets
    .from('tickets')
    .select('seat_no')
    .eq('route_id', routeId)
    .eq('status', 'paid')

  const assignedSeatNos = new Set(tickets?.map((t) => t.seat_no) || [])
  const onlineSold = Array.from(assignedSeatNos).filter(
    (seatNo) => seatNo <= route.capacity_online
  ).length
  const onlineRemaining = route.capacity_online - onlineSold

  if (quantity > onlineRemaining) {
    throw new Error(
      `Only ${onlineRemaining} seats available. Please select fewer tickets.`
    )
  }

  // Calculate amount
  const amountCents = route.price_cents * quantity

  // Find or create customer for this user
  const { data: userData } = await supabase.auth.getUser()
  const userEmail = userData.data.user?.email

  if (!userEmail) {
    throw new Error('User email not found')
  }

  let customerId: string

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', userEmail)
    .single()

  if (existingCustomer) {
    customerId = existingCustomer.id
  } else {
    // Create customer for authenticated user
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: userEmail.split('@')[0], // Default name from email
        email: userEmail,
        phone: '',
        user_id: user.id,
      })
      .select()
      .single()

    if (customerError) {
      throw new Error(`Failed to create customer: ${customerError.message}`)
    }

    customerId = newCustomer.id
  }

  // Create order with status 'created' and source 'online'
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      route_id: routeId,
      customer_id: customerId,
      user_id: user.id,
      quantity,
      amount_cents: amountCents,
      currency: route.currency,
      status: 'created',
      source: 'online',
      metadata: {},
      stripe_session_id: `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      stripe_payment_intent_id: null,
    })
    .select()
    .single()

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`)
  }

  return order.id
}
