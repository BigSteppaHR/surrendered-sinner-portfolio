
import { useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthContext, AuthContextType } from '@/components/AuthProvider';

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
