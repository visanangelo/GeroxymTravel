-- View: admin_dashboard_stats
-- Single source of truth for admin dashboard KPIs. One query, no app-side aggregation.
-- Use this in the app instead of computing from routes/route_seats/tickets.

DROP VIEW IF EXISTS admin_dashboard_stats;

CREATE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.routes WHERE status = 'active') AS active_routes_count,
  (SELECT COUNT(*) FROM public.routes WHERE status = 'draft') AS draft_routes_count,
  (SELECT COUNT(*) FROM public.routes WHERE status = 'cancelled') AS cancelled_routes_count,
  (SELECT COALESCE(SUM(CASE WHEN rs.pool = 'online' AND t.id IS NOT NULL THEN 1 ELSE 0 END), 0)
   FROM public.route_seats rs
   JOIN public.routes r ON r.id = rs.route_id AND r.status = 'active'
   LEFT JOIN public.tickets t ON t.route_id = rs.route_id AND t.seat_no = rs.seat_no AND t.status = 'paid'
  ) AS online_seats_sold,
  (SELECT COALESCE(SUM(CASE WHEN rs.pool = 'online' AND t.id IS NULL THEN 1 ELSE 0 END), 0)
   FROM public.route_seats rs
   JOIN public.routes r ON r.id = rs.route_id AND r.status = 'active'
   LEFT JOIN public.tickets t ON t.route_id = rs.route_id AND t.seat_no = rs.seat_no AND t.status = 'paid'
  ) AS online_seats_available,
  (SELECT COALESCE(SUM(r.reserve_offline), 0) FROM public.routes r WHERE r.status = 'active') AS total_offline_reserve;

-- App uses createServiceClient() (service_role) to read this view
GRANT SELECT ON admin_dashboard_stats TO authenticated;
GRANT SELECT ON admin_dashboard_stats TO service_role;

COMMENT ON VIEW admin_dashboard_stats IS 'KPIs for admin dashboard: route counts, online seats sold/available, offline reserve. One row.';
