-- Fix orders RLS policy to allow users to view orders via customer_id
-- This allows guest orders to appear in my-bookings after user signs up

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Recreate policy that allows viewing orders by:
-- 1. user_id (for authenticated user orders)
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

