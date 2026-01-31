-- Fix any views or queries that might reference routes.depart instead of routes.depart_at
-- This ensures all database views use the correct column name

-- Recreate admin_route_stats view with correct column name
CREATE OR REPLACE VIEW admin_route_stats AS
SELECT 
  r.id,
  r.origin,
  r.destination,
  r.depart_at,
  r.capacity_total,
  r.capacity_online,
  r.reserve_offline,
  r.status,
  r.price_cents,
  COUNT(DISTINCT CASE WHEN rs.pool = 'online' THEN rs.id END) as online_seats_total,
  COUNT(DISTINCT CASE WHEN rs.pool = 'offline' THEN rs.id END) as offline_seats_total,
  COUNT(DISTINCT CASE WHEN t.id IS NOT NULL AND rs.pool = 'online' THEN t.id END) as online_seats_assigned,
  COUNT(DISTINCT CASE WHEN t.id IS NOT NULL AND rs.pool = 'offline' THEN t.id END) as offline_seats_assigned,
  COUNT(DISTINCT CASE WHEN t.id IS NOT NULL THEN t.id END) as total_seats_assigned
FROM public.routes r
LEFT JOIN public.route_seats rs ON rs.route_id = r.id
LEFT JOIN public.tickets t ON t.route_id = r.id AND t.seat_no = rs.seat_no AND t.status = 'paid'
GROUP BY r.id, r.origin, r.destination, r.depart_at, r.capacity_total, r.capacity_online, r.reserve_offline, r.status, r.price_cents;

-- Grant access to authenticated users (RLS will handle permissions)
GRANT SELECT ON admin_route_stats TO authenticated;


