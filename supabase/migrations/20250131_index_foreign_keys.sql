-- Index foreign key columns for better join/constraint performance (lint 0001_unindexed_foreign_keys).
-- These may show as "unused" (lint 0005) until queries use them; keep them for FK/join performance.

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_route_id ON public.orders(route_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_created_by ON public.routes(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
