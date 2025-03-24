
import { useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthContext } from '@/components/AuthProvider';

export type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  email_confirmed?: boolean;
  email?: string;
  debug_mode?: boolean;
};

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null; data: any | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ 
    error: any | null, 
    data: { 
      user?: User | null,
      session?: Session | null,
      emailSent?: boolean,
      showVerification?: boolean,
      redirectTo?: string,
      redirectState?: any
    } | null 
  }>;
  logout: () => Promise<{ success: boolean; redirectTo?: string }>;
  refreshProfile: () => Promise<Profile | null>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: any | null }>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
