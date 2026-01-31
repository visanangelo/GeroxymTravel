-- Script to inspect current RLS policies and permissions
-- Run this in Supabase SQL Editor to see current state

-- ============================================
-- 1. CHECK RLS STATUS FOR RELEVANT TABLES
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tickets', 'orders', 'customers', 'routes')
ORDER BY tablename;

-- ============================================
-- 2. CHECK ALL RLS POLICIES FOR TICKETS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tickets'
ORDER BY policyname;

-- ============================================
-- 3. CHECK ALL RLS POLICIES FOR ORDERS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'orders'
ORDER BY policyname;

-- ============================================
-- 4. CHECK ALL RLS POLICIES FOR CUSTOMERS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'customers'
ORDER BY policyname;

-- ============================================
-- 5. CHECK FUNCTION PERMISSIONS (allocate_tickets)
-- ============================================
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE p.prosecdef 
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM pg_proc p
WHERE p.proname = 'allocate_tickets'
  AND p.pronamespace = 'public'::regnamespace;

-- Check function grants separately
SELECT 
  grantee as role_name,
  routine_name,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'allocate_tickets'
  AND grantee IN ('anon', 'authenticated', 'service_role', 'public')
ORDER BY grantee, privilege_type;

-- ============================================
-- 6. CHECK GRANT PERMISSIONS FOR TABLES
-- ============================================
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('tickets', 'orders', 'customers')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- ============================================
-- 7. CHECK IF CUSTOMERS TABLE EXISTS AND STRUCTURE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'customers'
ORDER BY ordinal_position;

-- ============================================
-- 8. CHECK IF ORDERS TABLE HAS customer_id COLUMN
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('customer_id', 'user_id')
ORDER BY column_name;

-- ============================================
-- 9. CHECK CURRENT FUNCTION DEFINITION
-- ============================================
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'allocate_tickets'
  AND pronamespace = 'public'::regnamespace;

