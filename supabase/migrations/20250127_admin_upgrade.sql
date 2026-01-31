-- Step 4: Admin Panel Upgrade Migration

-- 1. Add status to routes table
ALTER TABLE public.routes 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'cancelled', 'draft'));

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_depart_at ON public.routes(depart_at);

-- 2. Add source and update status constraint for orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'online' 
CHECK (source IN ('online', 'offline'));

-- Add metadata column for customer info (name, phone)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Drop and recreate status constraint to include 'paid_offline'
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('created', 'paid', 'paid_offline', 'cancelled', 'failed', 'refund_required'));

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_source ON public.orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_route_id ON public.orders(route_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- 3. Create helpful views for admin stats

-- View: Route statistics with seat counts
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

-- View: Dashboard KPIs
CREATE OR REPLACE VIEW admin_dashboard_stats AS
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

-- Grant access to authenticated users (RLS will handle permissions)
GRANT SELECT ON admin_route_stats TO authenticated;
GRANT SELECT ON admin_dashboard_stats TO authenticated;

