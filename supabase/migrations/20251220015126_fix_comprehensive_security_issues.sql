/*
  # Fix Comprehensive Security Issues
  
  ## Summary
  This migration addresses critical security and performance issues identified by Supabase security advisor.
  
  ## 1. Add Missing Indexes for Foreign Keys
  Foreign key columns without indexes cause slow query performance:
  - `admin_users.created_by` - References auth.users for audit trail
  - `driver_notifications.sent_by` - References auth.users who sent notification
  - `support_messages.user_id` - References auth.users for message ownership
  - `system_preferences.updated_by` - References auth.users for audit trail
  
  ## 2. Optimize RLS Policies (Prevent Re-evaluation)
  Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.
  This significantly improves query performance at scale.
  
  Tables updated:
  - route_subscriptions (4 policies)
  - admin_roles (1 policy)
  - system_preferences (1 policy)
  - audit_logs (1 policy)
  - data_exports (3 policies)
  - driver_notifications (1 policy)
  - support_messages (2 policies)
  - email_webhooks (1 policy)
  - admin_users (1 policy)
  - bus_tracking (2 policies)
  
  ## 3. Consolidate Multiple Permissive Policies
  Multiple permissive policies for the same role/action can be consolidated:
  - admin_roles - Keep both policies but optimize them
  - driver_performance - Consolidate view and manage policies
  - stops - Keep separate policies for different roles
  - trip_manifests - Keep separate policies for different roles
  
  ## 4. Fix Function Search Path Issues
  Functions without fixed search_path are vulnerable to search_path hijacking:
  - sync_driver_full_name
  - update_bus_tracking_updated_at
  
  ## 5. Enable RLS on Public Tables
  - email_logs - Enable RLS with appropriate policies
  
  ## Security Impact
  - Foreign key queries will be significantly faster
  - RLS policy evaluation is optimized for scale
  - Reduced policy redundancy and clearer access rules
  - Protection against search_path injection attacks
  - All public tables have proper access controls
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Index for admin_users.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by 
ON public.admin_users(created_by);

-- Index for driver_notifications.sent_by foreign key
CREATE INDEX IF NOT EXISTS idx_driver_notifications_sent_by 
ON public.driver_notifications(sent_by);

-- Index for support_messages.user_id foreign key (if not already exists)
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id 
ON public.support_messages(user_id);

-- Index for system_preferences.updated_by foreign key
CREATE INDEX IF NOT EXISTS idx_system_preferences_updated_by 
ON public.system_preferences(updated_by);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - PREVENT RE-EVALUATION
-- =====================================================

-- ROUTE_SUBSCRIPTIONS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.route_subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.route_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.route_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.route_subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON public.route_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own subscriptions"
  ON public.route_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own subscriptions"
  ON public.route_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own subscriptions"
  ON public.route_subscriptions
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ADMIN_ROLES TABLE POLICIES
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.admin_roles;

CREATE POLICY "Super admins can manage roles"
  ON public.admin_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = (SELECT auth.uid())
      AND ar.role_name = 'super_admin'
    )
  );

-- SYSTEM_PREFERENCES TABLE POLICIES
DROP POLICY IF EXISTS "Admin users can update system preferences" ON public.system_preferences;

CREATE POLICY "Admin users can update system preferences"
  ON public.system_preferences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid())
    )
  );

-- AUDIT_LOGS TABLE POLICIES
DROP POLICY IF EXISTS "Admin users can view audit logs" ON public.audit_logs;

CREATE POLICY "Admin users can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid())
    )
  );

-- DATA_EXPORTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view their own exports" ON public.data_exports;
DROP POLICY IF EXISTS "Users can create exports" ON public.data_exports;
DROP POLICY IF EXISTS "Users can update their own exports" ON public.data_exports;

CREATE POLICY "Users can view their own exports"
  ON public.data_exports
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create exports"
  ON public.data_exports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own exports"
  ON public.data_exports
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- DRIVER_NOTIFICATIONS TABLE POLICIES
DROP POLICY IF EXISTS "Drivers can view their own notifications" ON public.driver_notifications;

CREATE POLICY "Drivers can view their own notifications"
  ON public.driver_notifications
  FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = (SELECT auth.uid())
    )
  );

-- SUPPORT_MESSAGES TABLE POLICIES
DROP POLICY IF EXISTS "Users can insert own support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view own support messages" ON public.support_messages;

CREATE POLICY "Users can insert own support messages"
  ON public.support_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own support messages"
  ON public.support_messages
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- EMAIL_WEBHOOKS TABLE POLICIES
DROP POLICY IF EXISTS "email_webhooks_insert_authenticated" ON public.email_webhooks;

CREATE POLICY "email_webhooks_insert_authenticated"
  ON public.email_webhooks
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- ADMIN_USERS TABLE POLICIES
DROP POLICY IF EXISTS "Users can update own admin record" ON public.admin_users;

CREATE POLICY "Users can update own admin record"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- BUS_TRACKING TABLE POLICIES
DROP POLICY IF EXISTS "Users can view tracking for own bookings" ON public.bus_tracking;
DROP POLICY IF EXISTS "Users can update notification preferences" ON public.bus_tracking;

CREATE POLICY "Users can view tracking for own bookings"
  ON public.bus_tracking
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update notification preferences"
  ON public.bus_tracking
  FOR UPDATE
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 3. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- DRIVER_PERFORMANCE - Consolidate view and manage policies
DROP POLICY IF EXISTS "Authenticated users can view driver performance" ON public.driver_performance;
DROP POLICY IF EXISTS "Authenticated users can manage driver performance" ON public.driver_performance;

CREATE POLICY "Authenticated users can access driver performance"
  ON public.driver_performance
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: admin_roles, stops, and trip_manifests have overlapping policies but they serve
-- different purposes (one for anon, one for authenticated), so we'll leave them as is

-- =====================================================
-- 4. FIX FUNCTION SEARCH PATH ISSUES
-- =====================================================

-- Fix sync_driver_full_name function
DROP FUNCTION IF EXISTS public.sync_driver_full_name() CASCADE;

CREATE OR REPLACE FUNCTION public.sync_driver_full_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.full_name = CONCAT(NEW.first_name, ' ', NEW.last_name);
  RETURN NEW;
END;
$$;

-- Recreate trigger if the table has the columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'drivers' 
    AND column_name IN ('first_name', 'last_name')
  ) THEN
    DROP TRIGGER IF EXISTS sync_driver_full_name_trigger ON public.drivers;
    CREATE TRIGGER sync_driver_full_name_trigger
      BEFORE INSERT OR UPDATE OF first_name, last_name ON public.drivers
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_driver_full_name();
  END IF;
END $$;

-- Fix update_bus_tracking_updated_at function
DROP FUNCTION IF EXISTS public.update_bus_tracking_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_bus_tracking_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS set_bus_tracking_updated_at ON public.bus_tracking;
CREATE TRIGGER set_bus_tracking_updated_at
  BEFORE UPDATE ON public.bus_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bus_tracking_updated_at();

-- =====================================================
-- 5. ENABLE RLS ON PUBLIC TABLES
-- =====================================================

-- Enable RLS on email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only admin users can view email logs
DROP POLICY IF EXISTS "Admin users can view email logs" ON public.email_logs;
CREATE POLICY "Admin users can view email logs"
  ON public.email_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = (SELECT auth.uid())
    )
  );

-- System can insert email logs (for automated processes)
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;
CREATE POLICY "System can insert email logs"
  ON public.email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);