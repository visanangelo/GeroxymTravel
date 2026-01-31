-- Quick check for tickets RLS policies
-- Run this to see what policies exist for tickets table

-- 1. Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'tickets';

-- 2. Check ALL policies for tickets table
SELECT 
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tickets'
ORDER BY policyname;

-- 3. Check if there are any policies that reference auth.users
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('tickets', 'orders', 'customers')
  AND (qual::text LIKE '%auth.users%' OR qual::text LIKE '%auth.uid%')
ORDER BY tablename, policyname;

