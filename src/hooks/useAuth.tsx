import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
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
  // Add other profile fields here
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, data?: any) => Promise<AuthResponse>;
  logout: () => Promise<void>; // Ensure this is named 'logout' not 'signOut'
  resetPassword: (email: string) => Promise<{ data: any; error: Error | null }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<any>;
  setNewPassword: (password: string) => Promise<any>;
  deleteAccount: () => Promise<any>;
}

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        setProfile(data as UserProfile);
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
        return { user: null, session: null, error };
      }

      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user!.id);
      toast({
        title: 'Login Successful',
        description: 'You have successfully logged in.',
      });
      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { user: null, session: null, error: new Error(error.message || 'An unexpected error occurred') };
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
        return { user: null, session: null, error: authError };
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
      return { user: authData.user, session: authData.session, error: null };
    } catch (error: any) {
      toast({
        title: 'Signup Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { user: null, session: null, error: new Error(error.message || 'An unexpected error occurred') };
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

  const setNewPassword = async (password: string): Promise<any> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: 'Set New Password Failed',
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
        title: 'Set New Password Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { error: new Error(error.message || 'An unexpected error occurred') };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<any> => {
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

      setProfile(profileData as UserProfile);
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
      // First, delete the user from auth.users
      const { error: deleteAuthError } = await supabase.auth.deleteUser({
        userId: user.id
      });

      if (deleteAuthError) {
        toast({
          title: 'Delete Account Failed',
          description: deleteAuthError.message,
          variant: 'destructive',
        });
        return { error: deleteAuthError };
      }

      // If auth deletion is successful, also delete the profile
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

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    setNewPassword,
    deleteAccount,
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
