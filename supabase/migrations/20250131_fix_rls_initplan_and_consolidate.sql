-- Fix Supabase linter: auth_rls_initplan + multiple_permissive_policies + duplicate_index + unindexed FK
-- Use (select auth.uid()) so auth is evaluated once per query; consolidate multiple policies per role/action.

-- ============================================
-- 1. DROP ALL POLICIES (both naming conventions)
-- ============================================

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- customers
DROP POLICY IF EXISTS "Admins can read all customers" ON public.customers;
DROP POLICY IF EXISTS "Users can read their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customer data" ON public.customers;

-- orders
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders with customer" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS orders_user_read_own ON public.orders;
DROP POLICY IF EXISTS orders_user_insert_own ON public.orders;
DROP POLICY IF EXISTS orders_admin_read_all ON public.orders;

-- tickets
DROP POLICY IF EXISTS "Admins can insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Public can read ticket availability" ON public.tickets;
DROP POLICY IF EXISTS tickets_user_read_own_via_order ON public.tickets;
DROP POLICY IF EXISTS tickets_admin_read_all ON public.tickets;

-- routes
DROP POLICY IF EXISTS "Admins can view all routes" ON public.routes;
DROP POLICY IF EXISTS "Public can read active routes" ON public.routes;
DROP POLICY IF EXISTS routes_public_read ON public.routes;

-- ============================================
-- 2. PROFILES – single policy per action with (select auth.uid())
-- ============================================

CREATE POLICY profiles_select_own ON public.profiles
FOR SELECT TO authenticated
USING (id = (select auth.uid()));

CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- ============================================
-- 3. CUSTOMERS – consolidated + (select auth.uid())
-- ============================================

-- INSERT: one policy (guest + auth checkout; required fields)
DROP POLICY IF EXISTS "Anyone can create customers" ON public.customers;
CREATE POLICY customers_insert ON public.customers
FOR INSERT TO authenticated, anon
WITH CHECK (
  full_name IS NOT NULL AND length(trim(full_name)) > 0
  AND email IS NOT NULL AND length(trim(email)) > 0
  AND phone IS NOT NULL AND length(trim(phone)) > 0
);

-- SELECT authenticated: one policy (admin OR own data)
CREATE POLICY customers_select ON public.customers
FOR SELECT TO authenticated
USING (
  (select auth.uid()) = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
);

-- UPDATE authenticated: one policy
CREATE POLICY customers_update_own ON public.customers
FOR UPDATE TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- ============================================
-- 4. ORDERS – consolidated + (select auth.uid())
-- ============================================

-- INSERT: one policy for anon + authenticated (guest or user)
CREATE POLICY orders_insert ON public.orders
FOR INSERT TO authenticated, anon
WITH CHECK (
  (customer_id IS NOT NULL) OR (user_id IS NOT NULL)
);

-- SELECT: one policy per role (anon may have none; authenticated = admin OR own)
CREATE POLICY orders_select ON public.orders
FOR SELECT TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = orders.customer_id AND c.user_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
);

-- UPDATE: one policy (admin OR own)
CREATE POLICY orders_update ON public.orders
FOR UPDATE TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
)
WITH CHECK (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
);

-- ============================================
-- 5. TICKETS – consolidated + (select auth.uid())
-- ============================================

-- INSERT: admins only
CREATE POLICY tickets_insert ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
);

-- SELECT: one policy – anon (uid null), admin, or own order; (select auth.uid()) for initplan
CREATE POLICY tickets_select ON public.tickets
FOR SELECT TO authenticated, anon
USING (
  (select auth.uid()) IS NULL
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = tickets.order_id
    AND (
      o.user_id = (select auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.customers c
        WHERE c.id = o.customer_id AND c.user_id = (select auth.uid())
      )
    )
  )
);

-- UPDATE: admins only
CREATE POLICY tickets_update ON public.tickets
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
);

-- ============================================
-- 6. ROUTES – consolidated + (select auth.uid())
-- ============================================

-- SELECT: one policy – public active routes OR admin
CREATE POLICY routes_select ON public.routes
FOR SELECT TO authenticated, anon
USING (
  status = 'active'
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  )
);

-- ============================================
-- 7. DUPLICATE INDEXES (keep _id, drop duplicate)
-- ============================================

DROP INDEX IF EXISTS public.idx_orders_route;
DROP INDEX IF EXISTS public.idx_tickets_route;

-- ============================================
-- 8. UNINDEXED FOREIGN KEY (routes.created_by)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_routes_created_by ON public.routes(created_by);
</think>
Corectând secțiunea tickets: prima variantă era prea permisivă; păstrăm o singură politică cu (select auth.uid()).
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace