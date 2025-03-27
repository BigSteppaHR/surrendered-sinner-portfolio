
-- Add payment_id column to workout_plans table to link payments
ALTER TABLE IF EXISTS public.workout_plans
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_plans_payment_id ON public.workout_plans(payment_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);
