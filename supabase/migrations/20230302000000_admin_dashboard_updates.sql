
-- Update workout_plans table to include payment_id if not already present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workout_plans' 
    AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE public.workout_plans 
    ADD COLUMN payment_id UUID REFERENCES public.payments(id);
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_workout_plans_payment_id 
    ON public.workout_plans(payment_id);
  END IF;
END $$;

-- Add notification_type to user_notifications if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_notifications' 
    AND column_name = 'notification_type'
  ) THEN
    -- First check if the table exists
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'user_notifications'
    ) THEN
      -- Add notification_type if not already present
      ALTER TABLE public.user_notifications
      ADD COLUMN IF NOT EXISTS notification_type TEXT NOT NULL DEFAULT 'info';
    END IF;
  END IF;
END $$;

-- Update support_tickets table to include admin-related fields
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'support_tickets'
  ) THEN
    -- Add admin response fields if they don't exist
    ALTER TABLE public.support_tickets
    ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS response_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
  END IF;
END $$;

-- Create or update function to get all pending admin tasks
CREATE OR REPLACE FUNCTION public.get_admin_pending_tasks()
RETURNS TABLE (
  tickets_count BIGINT,
  notifications_count BIGINT,
  upcoming_sessions_count BIGINT,
  pending_payments_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'open') AS tickets_count,
    (SELECT COUNT(*) FROM public.user_notifications WHERE is_read = false AND notification_type = 'admin') AS notifications_count,
    (SELECT COUNT(*) FROM public.user_sessions WHERE session_time > NOW() AND session_time < NOW() + INTERVAL '7 days') AS upcoming_sessions_count,
    (SELECT COUNT(*) FROM public.payments WHERE status = 'pending') AS pending_payments_count;
END;
$$;

-- Ensure proper RLS policies are in place
DO $$
BEGIN
  -- For admin access to tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'support_tickets' 
    AND policyname = 'admin_tickets_policy'
  ) THEN
    CREATE POLICY admin_tickets_policy ON public.support_tickets
    FOR ALL
    TO authenticated
    USING (
      (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
    );
  END IF;
END $$;
