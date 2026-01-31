-- Guest Checkout Flow Migration
-- Allows customers to book tickets without creating an account

-- ============================================
-- 1. CREATE CUSTOMERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. UPDATE ORDERS TABLE
-- ============================================

-- Add customer_id column (make it required)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE RESTRICT;

-- Make user_id nullable (since guests don't have user_id)
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Create index for customer_id
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- ============================================
-- 3. RLS POLICIES FOR CUSTOMERS
-- ============================================

-- Allow anyone to insert customers (via server actions)
CREATE POLICY "Anyone can create customers"
ON public.customers
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to read their own customer record (by user_id or email)
CREATE POLICY "Users can read their own customer data"
ON public.customers
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow admins to read all customers
CREATE POLICY "Admins can read all customers"
ON public.customers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to update their own customer record
CREATE POLICY "Users can update their own customer data"
ON public.customers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 4. UPDATE ORDERS RLS POLICIES
-- ============================================

-- Allow anyone to create orders (via server actions with customer_id)
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Anyone can create orders with customer"
ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to read orders by user_id OR by customer email
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = orders.customer_id
    AND c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow guests to read orders by customer email (for confirmation pages)
-- This is handled via server-side checks, but we can add a policy for anon if needed
-- For now, we'll rely on server-side validation for guest access

-- Keep admin policies
-- (Admins can view all orders - already exists)

-- ============================================
-- 5. HELPER FUNCTION: Link customer to user
-- ============================================

CREATE OR REPLACE FUNCTION public.link_customer_to_user(
  customer_email text,
  user_uuid uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.customers
  SET user_id = user_uuid,
      updated_at = now()
  WHERE email = customer_email
    AND user_id IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_customer_to_user(text, uuid) TO authenticated;

