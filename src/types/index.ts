
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
}

// Weight record type
export interface WeightRecord {
  id: string;
  user_id: string;
  weight: number;
  recorded_at: string;
  notes: string | null;
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
