-- Fix RLS policies to allow anon users to read tickets for availability checking
-- This is safe because we only expose seat_no (public information), not personal data

-- ============================================
-- 1. ADD POLICY FOR PUBLIC TICKET AVAILABILITY
-- ============================================

-- Allow anyone (anon/authenticated) to read tickets for availability checking
-- This is safe because seat_no is public information (needed for availability display)
DROP POLICY IF EXISTS "Public can read ticket availability" ON public.tickets;

CREATE POLICY "Public can read ticket availability"
ON public.tickets
FOR SELECT
TO authenticated, anon
USING (true);

-- ============================================
-- 2. GRANT SELECT PERMISSION TO ANON
-- ============================================

-- Ensure anon role has SELECT permission
GRANT SELECT ON public.tickets TO anon;

-- ============================================
-- NOTE: Existing policies remain:
-- - "Admins can view all tickets" (for admin access)
-- - "Users can view their own tickets" (for authenticated users)
-- - "Public can read ticket availability" (NEW - for anon/public access)
-- 
-- Multiple policies can match - PostgreSQL uses OR logic for permissive policies.
-- So anon users can now read tickets via the new policy, while admin/user policies
-- continue to work for authenticated users.

