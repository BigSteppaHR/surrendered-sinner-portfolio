
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  email_confirmed?: boolean;
  is_admin?: boolean;
  debug_mode?: boolean;
  login_count?: number;
  last_login_at?: string;
  last_active_at?: string;
  username?: string;
  billing_address?: {
    city?: string;
    country?: string;
  };
  payment_method?: {
    card?: {
      brand?: string;
      last4?: string;
      exp_month?: number;
      exp_year?: number;
    };
  };
  updated_at?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin?: boolean;
  loginCount?: number;
  lastActive?: Date | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, data?: any) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: Error | null }>;
  updateUserProfile: (data: Partial<Profile>) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  setNewPassword: (password: string) => Promise<any>;
  deleteAccount: () => Promise<any>;
  refreshProfile: () => Promise<Profile | null>;
}

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
  data?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error: any) {
        console.error("Error loading session:", error);
        toast({
          title: "Session Error",
          description: "Failed to load session. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadSession();

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);
      if (event === 'INITIAL_SESSION') {
        // Skip initial session event, already handled in loadSession
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    });
  }, [toast]);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          email_confirmed,
          is_admin,
          debug_mode,
          login_count,
          last_login_at,
          last_active_at,
          username,
          billing_address,
          payment_method,
          updated_at,
          created_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Profile Error",
          description: "Failed to load profile. Please refresh.",
          variant: "destructive",
        });
      } else {
        setProfile(data as Profile);
      }
    } catch (error: any) {
      console.error("Unexpected error fetching profile:", error);
      toast({
        title: "Unexpected Profile Error",
        description: "An unexpected error occurred loading your profile.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          email_confirmed,
          is_admin,
          debug_mode,
          login_count,
          last_login_at,
          last_active_at,
          username,
          billing_address,
          payment_method,
          updated_at,
          created_at
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error refreshing profile:", error);
        return null;
      }
      
      setProfile(data as Profile);
      return data as Profile;
    } catch (error) {
      console.error("Error in refreshProfile:", error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { user: null, session: null, error, data: null };
      }

      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user!.id);
      toast({
        title: 'Login Successful',
        description: 'You have successfully logged in.',
      });
      return { user: data.user, session: data.session, error: null, data };
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { user: null, session: null, error: new Error(error.message || 'An unexpected error occurred'), data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, data?: any): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...data, // Include any additional data
          },
        },
      });

      if (authError) {
        toast({
          title: 'Signup Failed',
          description: authError.message,
          variant: 'destructive',
        });
        return { user: null, session: null, error: authError, data: null };
      }

      setUser(authData.user);
      setSession(authData.session);
      if (authData.user) {
        await fetchProfile(authData.user.id);
      }
      toast({
        title: 'Signup Successful',
        description: 'Please check your email to verify your account.',
      });
      return { user: authData.user, session: authData.session, error: null, data: authData };
    } catch (error: any) {
      toast({
        title: 'Signup Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { user: null, session: null, error: new Error(error.message || 'An unexpected error occurred'), data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: 'Logout Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        toast({
          title: 'Logout Successful',
          description: 'You have been successfully logged out.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast({
        title: 'Logout Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ data: any; error: Error | null }> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Reset Password Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { data: null, error };
      }

      toast({
        title: 'Reset Password Initiated',
        description: 'Please check your email for further instructions.',
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Reset Password Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { data: null, error: new Error(error.message || 'An unexpected error occurred') };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string): Promise<any> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: 'Update Password Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      });
      return { data };
    } catch (error: any) {
      toast({
        title: 'Update Password Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { error: new Error(error.message || 'An unexpected error occurred') };
    } finally {
      setIsLoading(false);
    }
  };

  const setNewPassword = updatePassword; // Alias for updatePassword

  const updateUserProfile = async (data: Partial<Profile>): Promise<any> => {
    if (!user?.id) {
      toast({
        title: 'Update Profile Failed',
        description: 'User ID not found. Please log in again.',
        variant: 'destructive',
      });
      return { error: new Error('User ID not found') };
    }

    try {
      setIsLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) {
        toast({
          title: 'Update Profile Failed',
          description: profileError.message,
          variant: 'destructive',
        });
        return { error: profileError };
      }

      setProfile(profileData as Profile);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      return { data: profileData };
    } catch (error: any) {
      toast({
        title: 'Update Profile Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { error: new Error(error.message || 'An unexpected error occurred') };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<any> => {
    if (!user?.id) {
      toast({
        title: 'Delete Account Failed',
        description: 'User ID not found. Please log in again.',
        variant: 'destructive',
      });
      return { error: new Error('User ID not found') };
    }

    try {
      setIsLoading(true);
      
      // First, delete the profile
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteProfileError) {
        toast({
          title: 'Delete Account Failed',
          description: deleteProfileError.message,
          variant: 'destructive',
        });
        return { error: deleteProfileError };
      }

      // Then, delete the auth user
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteAuthError) {
        toast({
          title: 'Delete Account Failed',
          description: deleteAuthError.message,
          variant: 'destructive',
        });
        return { error: deleteAuthError };
      }

      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);

      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted.',
      });
      navigate('/'); // Redirect to home or login page
      return { data: { message: 'Account deleted successfully' } };
    } catch (error: any) {
      toast({
        title: 'Delete Account Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { error: new Error(error.message || 'An unexpected error occurred') };
    } finally {
      setIsLoading(false);
    }
  };

  // Derived properties
  const isAuthenticated = !!user;
  const isAdmin = profile?.is_admin || false;
  const loginCount = profile?.login_count || 0;
  const lastActive = profile?.last_active_at ? new Date(profile.last_active_at) : null;

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isInitialized,
    isAdmin,
    loginCount,
    lastActive,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    setNewPassword,
    updatePassword,
    deleteAccount,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
