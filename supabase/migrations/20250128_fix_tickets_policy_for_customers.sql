-- Fix tickets RLS policy to allow users to view tickets for orders linked via customer_id
-- This allows guest orders (with customer_id) to show tickets in my-bookings after user signs up

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;

-- Recreate policy that allows viewing tickets for orders by:
-- 1. orders.user_id (for orders created when logged in)
-- 2. orders.customer_id where customer.user_id matches (for guest orders that were linked to user)
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = tickets.order_id
    AND (
      o.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.customers c
        WHERE c.id = o.customer_id
        AND c.user_id = auth.uid()
      )
    )
  )
);

