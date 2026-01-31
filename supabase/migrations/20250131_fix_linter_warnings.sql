-- Fix Supabase linter warnings: function search_path + RLS policies
-- Run after existing migrations. If ALTER FUNCTION fails (wrong signature),
-- check: SELECT proname, pg_get_function_identity_arguments(oid) FROM pg_proc WHERE proname IN ('is_admin','create_route_seats');

-- ============================================
-- 1. FUNCTION SEARCH PATH (security)
-- ============================================
-- Lint 0011: Functions must set search_path to avoid search_path injection.

ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.create_route_seats() SET search_path = public;

-- If the above fail (e.g. function has arguments), use the exact signature, e.g.:
-- ALTER FUNCTION public.is_admin(uuid) SET search_path = public;

-- ============================================
-- 2. RLS POLICIES – avoid WITH CHECK (true)
-- ============================================
-- Lint 0024: INSERT policies with WITH CHECK (true) bypass RLS. Use a real condition.

-- Customers: allow insert only with required fields (guest + auth checkout)
DROP POLICY IF EXISTS "Anyone can create customers" ON public.customers;
CREATE POLICY "Anyone can create customers"
ON public.customers
FOR INSERT
TO authenticated, anon
WITH CHECK (
  full_name IS NOT NULL AND length(trim(full_name)) > 0
  AND email IS NOT NULL AND length(trim(email)) > 0
  AND phone IS NOT NULL AND length(trim(phone)) > 0
);

-- Orders: allow insert only when linked to a customer or user (guest or auth)
DROP POLICY IF EXISTS "Anyone can create orders with customer" ON public.orders;
CREATE POLICY "Anyone can create orders with customer"
ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  (customer_id IS NOT NULL) OR (user_id IS NOT NULL)
);

-- ============================================
-- 3. LEAKED PASSWORD PROTECTION (Auth – Dashboard)
-- ============================================
-- Lint: auth_leaked_password_protection – not fixable via SQL.
-- Enable in Supabase Dashboard: Authentication → Providers → Email
-- → enable "Prevent the use of leaked passwords" (HaveIBeenPwned).
-- See: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
