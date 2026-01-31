-- Fix RLS policies for customers table to allow anonymous inserts
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can create customers" ON public.customers;

-- Create a more permissive policy for inserts
-- Allow both authenticated and anonymous users to create customers
CREATE POLICY "Anyone can create customers"
ON public.customers
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Also ensure the policy allows inserts with null user_id (for guests)
-- The WITH CHECK (true) should already allow this, but let's be explicit

-- Verify RLS is enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

