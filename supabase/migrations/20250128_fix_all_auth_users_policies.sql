-- Fix ALL RLS policies that reference auth.users directly
-- auth.users is not accessible in RLS policies - we must use auth.uid() instead
-- This fixes "permission denied for table users" errors

-- ============================================
-- 1. FIX CUSTOMERS POLICIES
-- ============================================

-- Drop and recreate the policy that uses auth.users
DROP POLICY IF EXISTS "Users can read their own customer data" ON public.customers;

CREATE POLICY "Users can read their own customer data"
ON public.customers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 2. FIX ORDERS POLICIES
-- ============================================

-- Drop the problematic policy that uses auth.users
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Recreate without auth.users reference
-- For authenticated users, allow viewing orders by:
-- 1. user_id (for orders created when logged in)
-- 2. customer_id where customer.user_id matches (for guest orders that were linked to user)
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = orders.customer_id
    AND c.user_id = auth.uid()
  )
);

-- Note: Guest orders access is handled via service client in application code
-- Admin access is handled by "Admins can view all orders" policy

-- ============================================
-- 3. ENSURE TICKETS POLICY EXISTS FOR PUBLIC ACCESS
-- ============================================

-- Add policy for public/anon ticket availability (if not exists)
DROP POLICY IF EXISTS "Public can read ticket availability" ON public.tickets;

CREATE POLICY "Public can read ticket availability"
ON public.tickets
FOR SELECT
TO authenticated, anon
USING (true);

-- Grant SELECT permission to anon
GRANT SELECT ON public.tickets TO anon;

-- ============================================
-- NOTES:
-- - Admin policies remain unchanged (they use profiles table, not auth.users)
-- - User policies now use only auth.uid() which is always available
-- - Guest access is handled via service client in application code
-- ============================================

