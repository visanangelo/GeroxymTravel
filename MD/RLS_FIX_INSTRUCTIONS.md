# Fix RLS Policies for Orders and Tickets Tables

## Problem
When creating offline orders, you get RLS policy violations:
1. `new row violates row-level security policy for table "orders"`
2. `new row violates row-level security policy for table "tickets"`

## Solution
The RLS policies on both `orders` and `tickets` tables need to allow admins to create records.

## Steps to Fix

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Run the complete SQL from `supabase/migrations/20250127_fix_all_rls.sql` (recommended)

OR run the individual fixes:

### For Orders Table:

```sql
-- Fix RLS policies for orders table to allow admins to create orders

-- Drop existing policies if they exist (adjust names if different)
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Allow admins to insert orders (including offline orders)
CREATE POLICY "Admins can insert orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update orders
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to view their own orders (if you want customers to see their orders)
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### For Tickets Table:

```sql
-- Allow admins to insert tickets
CREATE POLICY "Admins can insert tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update tickets
CREATE POLICY "Admins can update tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to view tickets for their own orders
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = tickets.order_id
    AND orders.user_id = auth.uid()
  )
);
```

4. After running both SQL scripts, try creating an offline order again.

**Recommended:** Run `supabase/migrations/20250127_fix_all_rls.sql` which includes both tables.

## What This Does

### Orders Table:
- Allows authenticated users with `role = 'admin'` in the `profiles` table to:
  - INSERT orders (create offline orders)
  - SELECT all orders (view all orders in admin panel)
  - UPDATE orders (modify order status, etc.)
- Allows regular users to view their own orders (by user_id)

### Tickets Table:
- Allows authenticated users with `role = 'admin'` in the `profiles` table to:
  - INSERT tickets (when creating orders)
  - SELECT all tickets (view all tickets in admin panel)
  - UPDATE tickets (modify ticket status, etc.)
- Allows regular users to view tickets for their own orders

This ensures RLS security while allowing admins to manage orders and tickets through the admin panel.

