
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';

// Define Database types to include all our tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean | null;
          email_confirmed: boolean | null;
          email: string | null;
          updated_at: string | null;
          debug_mode: boolean | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean | null;
          email_confirmed?: boolean | null;
          email?: string | null;
          updated_at?: string | null;
          debug_mode?: boolean | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean | null;
          email_confirmed?: boolean | null;
          email?: string | null;
          updated_at?: string | null;
          debug_mode?: boolean | null;
        };
      };
      verification_tokens: {
        Row: {
          id: string;
          token: string;
          user_email: string;
          expires_at: string;
          created_at: string;
          verified_at: string | null;
          token_type: string | null;
        };
        Insert: {
          id?: string;
          token: string;
          user_email: string;
          expires_at: string;
          created_at?: string;
          verified_at?: string | null;
          token_type?: string | null;
        };
        Update: {
          id?: string;
          token?: string;
          user_email?: string;
          expires_at?: string;
          created_at?: string;
          verified_at?: string | null;
          token_type?: string | null;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string;
          cost: number;
          session_time: string;
          location: string;
          is_paid: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: string;
          cost: number;
          session_time: string;
          location: string;
          is_paid?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: string;
          cost?: number;
          session_time?: string;
          location?: string;
          is_paid?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      weight_records: {
        Row: {
          id: string;
          user_id: string;
          weight: number;
          recorded_at: string;
          notes: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight: number;
          recorded_at?: string;
          notes?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weight?: number;
          recorded_at?: string;
          notes?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      workout_plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          pdf_url: string | null;
          plan_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          pdf_url?: string | null;
          plan_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          pdf_url?: string | null;
          plan_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_quotes: {
        Row: {
          id: string;
          quote: string;
          author: string | null;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote: string;
          author?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote?: string;
          author?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          created_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: any;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value: any;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: any;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          notification_type: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          notification_type?: string;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          notification_type?: string;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          status: 'open' | 'in_progress' | 'closed';
          priority: 'low' | 'medium' | 'high';
          type: string;
          created_at: string;
          updated_at: string;
          response_time: string | null;
          last_updated_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          status?: 'open' | 'in_progress' | 'closed';
          priority?: 'low' | 'medium' | 'high';
          type: string;
          created_at?: string;
          updated_at?: string;
          response_time?: string | null;
          last_updated_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          status?: 'open' | 'in_progress' | 'closed';
          priority?: 'low' | 'medium' | 'high';
          type?: string;
          created_at?: string;
          updated_at?: string;
          response_time?: string | null;
          last_updated_by?: string | null;
        };
      };
      support_ticket_responses: {
        Row: {
          id: string;
          ticket_id: string;
          response_text: string;
          responded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          response_text: string;
          responded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          response_text?: string;
          responded_by?: string;
          created_at?: string;
        };
      };
      admin_statistics: {
        Row: {
          id: string;
          stat_name: string;
          stat_value: number;
          stat_change: number;
          is_positive: boolean;
          icon: string | null;
          time_period: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stat_name: string;
          stat_value: number;
          stat_change?: number;
          is_positive?: boolean;
          icon?: string | null;
          time_period?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stat_name?: string;
          stat_value?: number;
          stat_change?: number;
          is_positive?: boolean;
          icon?: string | null;
          time_period?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_quote_of_the_day: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          quote: string;
          author: string | null;
        }[];
      };
      is_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    };
  };
};

const SUPABASE_URL = "https://tcxwvsyfqjcgglyqlahl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHd2c3lmcWpjZ2dseXFsYWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODM2MjEsImV4cCI6MjA1ODM1OTYyMX0.lGygYfHKmfuTlS-B0-AiU8Y7iHfIGxM5dTfxhId6O9c";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
