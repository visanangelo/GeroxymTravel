-- Add RLS policy to allow public/anon users to read active routes
-- This is needed for the public routes listing page

-- ============================================
-- 1. ENABLE RLS ON ROUTES TABLE (if not already enabled)
-- ============================================
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ADD POLICY FOR PUBLIC ROUTE ACCESS
-- ============================================

-- Allow anyone (anon/authenticated) to read active routes
-- This is safe because route information (origin, destination, price, etc.) is public
DROP POLICY IF EXISTS "Public can read active routes" ON public.routes;

CREATE POLICY "Public can read active routes"
ON public.routes
FOR SELECT
TO authenticated, anon
USING (status = 'active');

-- ============================================
-- 3. ADD POLICY FOR ADMIN FULL ACCESS
-- ============================================

-- Allow admins to read all routes (including cancelled/draft)
DROP POLICY IF EXISTS "Admins can view all routes" ON public.routes;

CREATE POLICY "Admins can view all routes"
ON public.routes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 4. GRANT SELECT PERMISSION TO ANON
-- ============================================

-- Ensure anon role has SELECT permission
GRANT SELECT ON public.routes TO anon;

-- ============================================
-- NOTES:
-- - Public users can only see routes with status = 'active'
-- - Admins can see all routes (active, cancelled, draft)
-- - This allows the public routes page to display available routes
-- - Admin pages will continue to work as they use authenticated client
-- ============================================
