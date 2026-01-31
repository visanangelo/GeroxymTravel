-- Performance Optimization: Add indexes for frequently queried columns
-- Date: 2025-01-28

-- Routes table indexes
-- Used for: filtering by status, sorting by depart_at, searching by origin/destination
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_depart_at ON public.routes(depart_at);
CREATE INDEX IF NOT EXISTS idx_routes_origin ON public.routes(origin);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON public.routes(destination);
CREATE INDEX IF NOT EXISTS idx_routes_status_depart_at ON public.routes(status, depart_at);

-- Tickets table indexes
-- Used for: finding tickets by route_id, checking seat availability, filtering by status
CREATE INDEX IF NOT EXISTS idx_tickets_route_id ON public.tickets(route_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_route_seat ON public.tickets(route_id, seat_no);
CREATE INDEX IF NOT EXISTS idx_tickets_route_status ON public.tickets(route_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);

-- Orders table indexes
-- Used for: finding orders by user_id, customer_id, filtering by status, sorting by created_at
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON public.orders(customer_id, status);

-- Customers table indexes
-- Used for: finding customer by email, linking to user_id
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Route seats table indexes (if exists)
-- Used for: finding available seats by route_id and pool
CREATE INDEX IF NOT EXISTS idx_route_seats_route_pool ON public.route_seats(route_id, pool);

-- Analyze tables to update statistics
ANALYZE public.routes;
ANALYZE public.tickets;
ANALYZE public.orders;
ANALYZE public.customers;
ANALYZE public.route_seats;

