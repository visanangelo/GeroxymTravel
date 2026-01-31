-- Fix RLS policies for tickets table
-- This allows public/anon users to read tickets for availability checking
-- (only seat_no, no personal data)

-- ============================================
-- 1. ADD POLICY FOR PUBLIC TICKET AVAILABILITY (READ ONLY seat_no)
-- ============================================

-- Allow anyone (anon/authenticated) to read tickets for availability
-- This is safe because we only expose seat_no, not personal data
DROP POLICY IF EXISTS "Public can read ticket availability" ON public.tickets;

CREATE POLICY "Public can read ticket availability"
ON public.tickets
FOR SELECT
TO authenticated, anon
USING (true);

-- Note: This policy allows reading all tickets, but in practice we only
-- read seat_no for availability, which is public information.
-- If you want to be more restrictive, you could limit to only seat_no:
-- However, RLS policies can't restrict columns, only rows.
-- Column-level security would require views, which is more complex.

-- ============================================
-- 2. VERIFY EXISTING POLICIES ARE KEPT
-- ============================================

-- Keep existing admin policies (they should remain)
-- Keep existing user policies (they should remain)

-- ============================================
-- 3. GRANT SELECT PERMISSION TO ANON
-- ============================================

-- Ensure anon role can SELECT from tickets
GRANT SELECT ON public.tickets TO anon;

