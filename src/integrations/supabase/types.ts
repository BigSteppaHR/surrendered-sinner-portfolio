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
      daily_quotes: {
        Row: {
          author: string | null
          created_at: string
          id: string
          is_active: boolean
          quote: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          quote: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          quote?: string
        }
        Relationships: []
      }
      payment_balance: {
        Row: {
          balance: number
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
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
          email: string | null
          email_confirmed: boolean | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          profile_picture_url: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          profile_picture_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          profile_picture_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subscription_packages: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string | null
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
          description?: string | null
          id?: string
          pdf_url?: string | null
          plan_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_quote_of_the_day: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          quote: string
          author: string
        }[]
      }
      get_user_profile:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              id: string
              email: string
              full_name: string
              is_admin: boolean
              email_confirmed: boolean
              avatar_url: string
            }[]
          }
        | {
            Args: {
              user_id: number
            }
            Returns: {
              id: number
              username: string
              email: string
            }[]
          }
      is_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
            }
            Returns: boolean
          }
      is_email_verified:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_email: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
