export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_balance: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          points: number
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          points?: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points?: number
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          read_by: string | null
          source: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          read_by?: string | null
          source?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          read_by?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_statistics: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_positive: boolean | null
          stat_change: number | null
          stat_name: string
          stat_value: number
          time_period: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_positive?: boolean | null
          stat_change?: number | null
          stat_name: string
          stat_value: number
          time_period?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_positive?: boolean | null
          stat_change?: number | null
          stat_name?: string
          stat_value?: number
          time_period?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          priority: string
          reference_id: string | null
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          priority?: string
          reference_id?: string | null
          status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          reference_id?: string | null
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_dashboards: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          external_calendar_id: string | null
          id: string
          location: string | null
          meeting_link: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string
          external_calendar_id?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          external_calendar_id?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      client_coach_matches: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          id: string
          message: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coach_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          primary_style: string | null
          rating: number | null
          social_links: Json | null
          specialty: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          primary_style?: string | null
          rating?: number | null
          social_links?: Json | null
          specialty?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          primary_style?: string | null
          rating?: number | null
          social_links?: Json | null
          specialty?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_profiles_primary_style_fkey"
            columns: ["primary_style"]
            isOneToOne: false
            referencedRelation: "coaching_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_reviews: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          id: string
          match_id: string
          rating: number
          review_text: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          match_id: string
          rating: number
          review_text?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          match_id?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_reviews_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "client_coach_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          match_id: string
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          match_id: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          match_id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "client_coach_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_styles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      custom_plan_results: {
        Row: {
          created_at: string
          id: string
          is_purchased: boolean
          plan_features: Json | null
          purchase_date: string | null
          quiz_answers: Json
          selected_plan_id: string | null
          selected_plan_name: string | null
          selected_plan_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_purchased?: boolean
          plan_features?: Json | null
          purchase_date?: string | null
          quiz_answers: Json
          selected_plan_id?: string | null
          selected_plan_name?: string | null
          selected_plan_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_purchased?: boolean
          plan_features?: Json | null
          purchase_date?: string | null
          quiz_answers?: Json
          selected_plan_id?: string | null
          selected_plan_name?: string | null
          selected_plan_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_quotes: {
        Row: {
          author: string | null
          created_at: string
          id: string
          is_active: boolean
          is_featured: boolean | null
          quote: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          quote: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          quote?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          is_published: boolean | null
          location: string | null
          max_attendees: number | null
          organizer_id: string | null
          start_time: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_time: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      file_download_logs: {
        Row: {
          download_time: string
          file_id: string
          id: string
          user_id: string
        }
        Insert: {
          download_time?: string
          file_id: string
          id?: string
          user_id: string
        }
        Update: {
          download_time?: string
          file_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_download_logs_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "user_files"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_name: string
          description: string | null
          due_date: string | null
          id: string
          issued_date: string | null
          payment_link: string | null
          status: string | null
          stripe_invoice_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name: string
          description?: string | null
          due_date?: string | null
          id?: string
          issued_date?: string | null
          payment_link?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string
          description?: string | null
          due_date?: string | null
          id?: string
          issued_date?: string | null
          payment_link?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lift_records: {
        Row: {
          bench: number
          bodyweight: number
          created_at: string
          deadlift: number
          id: string
          notes: string | null
          recorded_at: string
          squat: number
          user_id: string | null
        }
        Insert: {
          bench?: number
          bodyweight?: number
          created_at?: string
          deadlift?: number
          id?: string
          notes?: string | null
          recorded_at?: string
          squat?: number
          user_id?: string | null
        }
        Update: {
          bench?: number
          bodyweight?: number
          created_at?: string
          deadlift?: number
          id?: string
          notes?: string | null
          recorded_at?: string
          squat?: number
          user_id?: string | null
        }
        Relationships: []
      }
      payment_balance: {
        Row: {
          amount: number | null
          balance: number
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          balance?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          balance?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          status: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          payment_method: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_records: {
        Row: {
          created_at: string
          exercise_type: string
          id: string
          notes: string | null
          recorded_at: string
          reps: number
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          exercise_type: string
          id?: string
          notes?: string | null
          recorded_at?: string
          reps?: number
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          exercise_type?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          reps?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coach_application_status: string | null
          debug_mode: boolean | null
          email: string | null
          email_confirmed: boolean
          email_verified_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          is_coach: boolean | null
          last_active_at: string | null
          last_login_at: string | null
          login_count: number | null
          password_reset_sent_at: string | null
          password_reset_token: string | null
          profile_picture_url: string | null
          updated_at: string | null
          username: string | null
          weight_goal: number | null
        }
        Insert: {
          avatar_url?: string | null
          coach_application_status?: string | null
          debug_mode?: boolean | null
          email?: string | null
          email_confirmed?: boolean
          email_verified_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_coach?: boolean | null
          last_active_at?: string | null
          last_login_at?: string | null
          login_count?: number | null
          password_reset_sent_at?: string | null
          password_reset_token?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
          username?: string | null
          weight_goal?: number | null
        }
        Update: {
          avatar_url?: string | null
          coach_application_status?: string | null
          debug_mode?: boolean | null
          email?: string | null
          email_confirmed?: boolean
          email_verified_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_coach?: boolean | null
          last_active_at?: string | null
          last_login_at?: string | null
          login_count?: number | null
          password_reset_sent_at?: string | null
          password_reset_token?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
          username?: string | null
          weight_goal?: number | null
        }
        Relationships: []
      }
      revenue_data: {
        Row: {
          created_at: string
          id: string
          month: string
          revenue: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          revenue: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          revenue?: number
        }
        Relationships: []
      }
      site_traffic: {
        Row: {
          created_at: string
          date: string
          id: string
          visits: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          visits: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          visits?: number
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string
          id: string
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_addons: {
        Row: {
          addon_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          addon_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          addon_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_packages: {
        Row: {
          billing_interval: string | null
          created_at: string
          currency: string
          description: string | null
          display_order: number | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id: string
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_ticket_responses: {
        Row: {
          created_at: string | null
          id: string
          responded_by: string | null
          response_text: string
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          responded_by?: string | null
          response_text: string
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          responded_by?: string | null
          response_text?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          last_updated_by: string | null
          message: string
          priority: string | null
          response_time: string | null
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated_by?: string | null
          message: string
          priority?: string | null
          response_time?: string | null
          status?: string
          subject: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_updated_by?: string | null
          message?: string
          priority?: string | null
          response_time?: string | null
          status?: string
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      training_packages: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean
          name: string
          price: number
          sessions_included: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          sessions_included?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sessions_included?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addon_purchases: {
        Row: {
          addon_id: string
          created_at: string
          id: string
          is_used: boolean
          metadata: Json | null
          purchase_date: string
          status: string
          subscription_id: string | null
          updated_at: string
          used_date: string | null
          user_id: string
        }
        Insert: {
          addon_id: string
          created_at?: string
          id?: string
          is_used?: boolean
          metadata?: Json | null
          purchase_date?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          used_date?: string | null
          user_id: string
        }
        Update: {
          addon_id?: string
          created_at?: string
          id?: string
          is_used?: boolean
          metadata?: Json | null
          purchase_date?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          used_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addon_purchases_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "subscription_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_addon_purchases_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_files: {
        Row: {
          description: string | null
          download_url: string
          file_category: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          plan_id: string | null
          subscription_id: string | null
          uploaded_at: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          download_url: string
          file_category?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          plan_id?: string | null
          subscription_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          download_url?: string
          file_category?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          plan_id?: string | null
          subscription_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_files_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_files_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_completions"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "user_files_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_files_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_files_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          cost: number
          created_at: string
          id: string
          is_paid: boolean
          location: string
          notes: string | null
          session_time: string
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          is_paid?: boolean
          location: string
          notes?: string | null
          session_time: string
          session_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          is_paid?: boolean
          location?: string
          notes?: string | null
          session_time?: string
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscription_purchases: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          purchase_date: string | null
          quiz_result_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          purchase_date?: string | null
          quiz_result_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          purchase_date?: string | null
          quiz_result_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscription_purchases_quiz_result_id_fkey"
            columns: ["quiz_result_id"]
            isOneToOne: false
            referencedRelation: "custom_plan_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscription_purchases_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscription_purchases_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          package_id: string
          payment_id: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          package_id: string
          payment_id?: string | null
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          package_id?: string
          payment_id?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payment_history"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          token_type: string | null
          user_email: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          token_type?: string | null
          user_email: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          token_type?: string | null
          user_email?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      weight_records: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean
          notes: string | null
          recorded_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          notes?: string | null
          recorded_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          notes?: string | null
          recorded_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string
          custom_plan_result_id: string | null
          description: string | null
          id: string
          pdf_url: string | null
          plan_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_plan_result_id?: string | null
          description?: string | null
          id?: string
          pdf_url?: string | null
          plan_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_plan_result_id?: string | null
          description?: string | null
          id?: string
          pdf_url?: string | null
          plan_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_custom_plan_result_id_fkey"
            columns: ["custom_plan_result_id"]
            isOneToOne: false
            referencedRelation: "custom_plan_results"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      coach_profiles_view: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string | null
          is_available: boolean | null
          primary_style: string | null
          primary_style_name: string | null
          rating: number | null
          social_links: Json | null
          specialty: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_profiles_primary_style_fkey"
            columns: ["primary_style"]
            isOneToOne: false
            referencedRelation: "coaching_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          admin_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          external_calendar_id: string | null
          id: string | null
          location: string | null
          meeting_link: string | null
          start_time: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          external_calendar_id?: string | null
          id?: string | null
          location?: string | null
          meeting_link?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          external_calendar_id?: string | null
          id?: string | null
          location?: string | null
          meeting_link?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string | null
          metadata: Json | null
          payment_intent_id: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          description: string | null
          features: Json | null
          id: string | null
          interval: string | null
          is_active: boolean | null
          monthly_price: number | null
          name: string | null
          price: number | null
          stripe_price_id: string | null
        }
        Insert: {
          description?: string | null
          features?: Json | null
          id?: string | null
          interval?: string | null
          is_active?: boolean | null
          monthly_price?: number | null
          name?: string | null
          price?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          description?: string | null
          features?: Json | null
          id?: string | null
          interval?: string | null
          is_active?: boolean | null
          monthly_price?: number | null
          name?: string | null
          price?: number | null
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          feature_name: string | null
          id: string | null
          limit_count: number | null
          subscription_id: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          feature_name?: never
          id?: string | null
          limit_count?: never
          subscription_id?: string | null
          updated_at?: string | null
          usage_count?: never
          user_id?: string | null
        }
        Update: {
          feature_name?: never
          id?: string | null
          limit_count?: never
          subscription_id?: string | null
          updated_at?: string | null
          usage_count?: never
          user_id?: string | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string | null
          goal_type: string | null
          goal_value: number | null
          id: string | null
          notes: string | null
          progress: number | null
          status: string | null
          target_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          goal_type?: never
          goal_value?: never
          id?: string | null
          notes?: never
          progress?: never
          status?: never
          target_date?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          goal_type?: never
          goal_value?: never
          id?: string | null
          notes?: never
          progress?: never
          status?: never
          target_date?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workout_completions: {
        Row: {
          completed_at: string | null
          duration_minutes: number | null
          id: string | null
          notes: string | null
          rating: number | null
          user_id: string | null
          workout_id: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_minutes?: never
          id?: string | null
          notes?: never
          rating?: never
          user_id?: string | null
          workout_id?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_minutes?: never
          id?: string | null
          notes?: never
          rating?: never
          user_id?: string | null
          workout_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_custom_plan_to_workout_plans: {
        Args: { p_user_id: string; p_custom_plan_result_id: string }
        Returns: string
      }
      current_user_is_verified: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_profile: {
        Args: { user_id: string }
        Returns: Json
      }
      get_quote_of_the_day: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          quote: string
          author: string
        }[]
      }
      get_user_profile: {
        Args:
          | Record<PropertyKey, never>
          | { user_id: number }
          | { user_id: string }
        Returns: Json
      }
      get_visible_profiles: {
        Args: { viewing_user_id: string }
        Returns: {
          avatar_url: string | null
          coach_application_status: string | null
          debug_mode: boolean | null
          email: string | null
          email_confirmed: boolean
          email_verified_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          is_coach: boolean | null
          last_active_at: string | null
          last_login_at: string | null
          login_count: number | null
          password_reset_sent_at: string | null
          password_reset_token: string | null
          profile_picture_url: string | null
          updated_at: string | null
          username: string | null
          weight_goal: number | null
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_email_verified: {
        Args:
          | Record<PropertyKey, never>
          | { user_email: string }
          | { user_id: number }
        Returns: boolean
      }
      is_profile_owner: {
        Args: { profile_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_payment_status: {
        Args: {
          payment_id: string
          new_status: string
          payment_intent_id?: string
          payment_method?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
