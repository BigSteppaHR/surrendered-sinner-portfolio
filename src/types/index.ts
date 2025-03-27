// User session type
export interface UserSession {
  id: string;
  user_id: string;
  session_type: string;
  cost: number;
  session_time: string;
  location: string;
  is_paid: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

// Weight record type
export interface WeightRecord {
  id: string;
  user_id: string;
  weight: number;
  recorded_at: string;
  notes: string | null;
  image_url: string | null;
  is_approved: boolean;
  created_at?: string;
}

// Workout plan type
export interface WorkoutPlan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  plan_type: string;
  created_at?: string;
  updated_at?: string;
}

// User file type
export interface UserFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  description: string;
  download_url: string;
  uploaded_at: string;
  file_path: string;
  plan_id?: string;
  plan_name?: string;
  workout_plans?: WorkoutPlan | null;
  user_id?: string;
}

// Quote type
export interface Quote {
  id: string;
  quote: string;
  author: string | null;
  is_active?: boolean;
  created_at?: string;
}

// User details
export interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
}

// Support ticket type
export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  type: 'inquiry' | 'call_request';
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  email_confirmed: boolean;
  avatar_url: string | null;
  is_admin: boolean;
  username: string | null;
  updated_at: string | null;
}

// Payment history type
export interface PaymentHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  status: string;
  stripe_payment_id: string | null;
  description: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

// Training package type
export interface TrainingPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number | null;
  sessions_included: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
