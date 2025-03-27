
-- Create admin_tasks table to track pending admin tasks
CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL, -- 'support', 'payment', 'session', 'notification'
  reference_id UUID, -- ID of the related item (ticket ID, payment ID, etc.)
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'complete'
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ
);

-- Add RLS policies for admin_tasks
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows only admins to view all tasks
CREATE POLICY "Admin users can view all tasks" 
  ON public.admin_tasks 
  FOR SELECT 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create a policy that allows only admins to insert tasks
CREATE POLICY "Admin users can create tasks" 
  ON public.admin_tasks 
  FOR INSERT 
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create a policy that allows only admins to update tasks
CREATE POLICY "Admin users can update tasks" 
  ON public.admin_tasks 
  FOR UPDATE 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create a policy that allows only admins to delete tasks
CREATE POLICY "Admin users can delete tasks" 
  ON public.admin_tasks 
  FOR DELETE 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create function to get admin dashboard summary
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_summary()
RETURNS TABLE (
  pending_sessions_count INTEGER,
  pending_payments_count INTEGER,
  open_tickets_count INTEGER,
  unread_notifications_count INTEGER,
  recent_signups_count INTEGER,
  revenue_mtd NUMERIC,
  active_subscriptions_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.user_sessions WHERE session_time > now() AND session_time < now() + interval '7 days')::INTEGER AS pending_sessions_count,
    (SELECT COUNT(*) FROM public.payments WHERE status = 'pending')::INTEGER AS pending_payments_count,
    (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'open')::INTEGER AS open_tickets_count,
    (SELECT COUNT(*) FROM public.user_notifications WHERE is_read = false AND notification_type = 'admin')::INTEGER AS unread_notifications_count,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at > now() - interval '30 days')::INTEGER AS recent_signups_count,
    COALESCE((SELECT SUM(amount) FROM public.payments WHERE status = 'completed' AND created_at > date_trunc('month', now())), 0)::NUMERIC AS revenue_mtd,
    (SELECT COUNT(*) FROM public.user_subscriptions WHERE is_active = true)::INTEGER AS active_subscriptions_count;
END;
$$;

-- Add trigger to update the last_updated timestamp on admin_tasks
CREATE OR REPLACE FUNCTION public.update_admin_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_task_timestamp
BEFORE UPDATE ON public.admin_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_task_timestamp();

-- Enable realtime subscriptions for admin-related tables
ALTER TABLE public.admin_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
