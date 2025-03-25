
import { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  is_admin?: boolean | null;
  email_confirmed?: boolean | null;
  updated_at?: string | null;
  debug_mode?: boolean | null;
  login_count?: number | null;
  last_active_at?: string | null;
};

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  loginCount: number;
  lastActive: Date | null;
  login: (email: string, password: string) => Promise<{ error: any | null, data: any | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: any | null, data: any | null }>;
  logout: () => Promise<{ success: boolean, redirectTo?: string }>;
  refreshProfile: () => Promise<Profile | null>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: any | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
