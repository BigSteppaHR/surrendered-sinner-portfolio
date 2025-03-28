
-- Create events table
CREATE TABLE IF NOT EXISTS "public"."events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "date" timestamp with time zone NOT NULL,
  "time" text,
  "location" text,
  "image_url" text,
  "is_online" boolean DEFAULT false,
  "price" numeric(10,2),
  "spots" integer,
  "spots_remaining" integer,
  "registration_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Create add-ons table
CREATE TABLE IF NOT EXISTS "public"."plan_addons" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "price" numeric(10,2) NOT NULL,
  "addon_type" text NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Create user purchases for add-ons
CREATE TABLE IF NOT EXISTS "public"."user_addons" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "addon_id" uuid NOT NULL,
  "purchase_date" timestamp with time zone DEFAULT now(),
  "expiry_date" timestamp with time zone,
  "status" text DEFAULT 'active',
  "payment_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("addon_id") REFERENCES "public"."plan_addons"("id") ON DELETE CASCADE
);

-- Create relationship between workout plans and add-ons
CREATE TABLE IF NOT EXISTS "public"."workout_plan_addons" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workout_plan_id" uuid NOT NULL,
  "addon_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE CASCADE,
  FOREIGN KEY ("addon_id") REFERENCES "public"."plan_addons"("id") ON DELETE CASCADE
);

-- Update payment table to support multiple payment methods
ALTER TABLE "public"."payments" 
ADD COLUMN IF NOT EXISTS "payment_method_details" jsonb;

-- Insert default add-ons
INSERT INTO "public"."plan_addons" ("name", "description", "price", "addon_type") VALUES
('Meal Plan Revision', 'Fine-tune your existing meal plan based on progress and preferences', 50.00, 'nutrition'),
('Lifting Plan Revision', 'Update your training program for continued progress and variety', 60.00, 'training'),
('Impromptu Coaching', 'On-the-spot advice for training, nutrition or competition questions', 40.00, 'coaching'),
('Progress Picture Analysis', 'Detailed feedback and analysis of your physique progress photos', 45.00, 'assessment');

-- Set up RLS policies
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."plan_addons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_addons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."workout_plan_addons" ENABLE ROW LEVEL SECURITY;

-- Everyone can view events
CREATE POLICY "Anyone can view events" ON "public"."events"
FOR SELECT USING (true);

-- Everyone can view add-ons
CREATE POLICY "Anyone can view add-ons" ON "public"."plan_addons"
FOR SELECT USING (true);

-- Users can view their own add-on purchases
CREATE POLICY "Users can view their own add-ons" ON "public"."user_addons"
FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all tables
CREATE POLICY "Admins can manage events" ON "public"."events"
FOR ALL USING (EXISTS (
  SELECT 1 FROM "public"."profiles"
  WHERE "profiles"."id" = auth.uid() AND "profiles"."is_admin" = true
));

CREATE POLICY "Admins can manage add-ons" ON "public"."plan_addons"
FOR ALL USING (EXISTS (
  SELECT 1 FROM "public"."profiles"
  WHERE "profiles"."id" = auth.uid() AND "profiles"."is_admin" = true
));

CREATE POLICY "Admins can manage user add-ons" ON "public"."user_addons"
FOR ALL USING (EXISTS (
  SELECT 1 FROM "public"."profiles"
  WHERE "profiles"."id" = auth.uid() AND "profiles"."is_admin" = true
));

CREATE POLICY "Admins can manage workout plan add-ons" ON "public"."workout_plan_addons"
FOR ALL USING (EXISTS (
  SELECT 1 FROM "public"."profiles"
  WHERE "profiles"."id" = auth.uid() AND "profiles"."is_admin" = true
));
