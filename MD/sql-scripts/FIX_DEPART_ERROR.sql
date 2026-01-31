-- Quick Fix for "column routes.depart does not exist" error
-- Run this in Supabase SQL Editor

-- First, let's see what views exist that might have the wrong column name
-- This will show any views that reference 'depart' without '_at'
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
AND (definition LIKE '%routes.depart%' OR definition LIKE '%r.depart%')
AND definition NOT LIKE '%depart_at%';

-- Drop all admin views to recreate them
DROP VIEW IF EXISTS admin_route_stats CASCADE;
DROP VIEW IF EXISTS admin_dashboard_stats CASCADE;

-- Recreate admin_route_stats view with CORRECT column name (depart_at)
CREATE VIEW admin_route_stats AS
SELECT 
  r.id,
  r.origin,
  r.destination,
  r.depart_at,  -- CORRECT: depart_at (not depart)
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

-- Recreate admin_dashboard_stats view
CREATE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.routes WHERE status = 'active') as active_routes_count,
  (SELECT COUNT(*) FROM public.routes WHERE status = 'cancelled') as cancelled_routes_count,
  (SELECT COUNT(*) FROM public.routes WHERE status = 'draft') as draft_routes_count,
  (SELECT COALESCE(SUM(CASE WHEN rs.pool = 'online' AND t.id IS NOT NULL THEN 1 ELSE 0 END), 0) 
   FROM public.route_seats rs
   LEFT JOIN public.tickets t ON t.route_id = rs.route_id AND t.seat_no = rs.seat_no AND t.status = 'paid'
   JOIN public.routes r ON r.id = rs.route_id
   WHERE r.status = 'active') as online_seats_sold,
  (SELECT COALESCE(SUM(CASE WHEN rs.pool = 'online' AND t.id IS NULL THEN 1 ELSE 0 END), 0)
   FROM public.route_seats rs
   LEFT JOIN public.tickets t ON t.route_id = rs.route_id AND t.seat_no = rs.seat_no AND t.status = 'paid'
   JOIN public.routes r ON r.id = rs.route_id
   WHERE r.status = 'active') as online_seats_available,
  (SELECT COALESCE(SUM(r.reserve_offline), 0) 
   FROM public.routes r 
   WHERE r.status = 'active') as total_offline_reserve;

-- Grant permissions
GRANT SELECT ON admin_route_stats TO authenticated;
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Verify the views were created correctly
SELECT viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('admin_route_stats', 'admin_dashboard_stats');


