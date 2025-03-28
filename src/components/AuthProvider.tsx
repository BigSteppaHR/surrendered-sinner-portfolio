import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/hooks/useAuth';

// Define types for the user profile
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  updated_at?: string;
  created_at?: string;
  website?: string;
  bio?: string;
  subscription_status?: string;
  role?: string;
  is_admin?: boolean;
  email_confirmed?: boolean;
  debug_mode?: boolean;
  login_count?: number;
  last_active_at?: string;
  last_login_at?: string;
}

// Define the Auth context type
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  loginCount: number;
  lastActive: Date | null;
  error: Error | null;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any | null, data: any | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: any | null, data: any | null }>;
  logout: () => Promise<{ success: boolean, redirectTo?: string }>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: any | null }>;
}

// Create the Auth context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  isAdmin: false,
  loginCount: 0,
  lastActive: null,
  error: null,
  refreshProfile: async () => null,
  signOut: async () => {},
  login: async () => ({ error: null, data: null }),
  signup: async () => ({ error: null, data: null }),
  logout: async () => ({ success: false }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Derive additional state values
  const isAuthenticated = !!user;
  const isAdmin = profile?.is_admin || false;
  const loginCount = profile?.login_count || 0;
  const lastActive = profile?.last_active_at ? new Date(profile.last_active_at) : null;

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        console.log("Auth state changed: INITIAL_SESSION");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          console.log("User signed in");
          await fetchUserProfile(data.session.user.id);
        }
      } catch (e: any) {
        console.error("Error during auth session fetch:", e);
        setError(e);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Call the function to fetch the initial session
    fetchInitialSession();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      } else if (event === 'USER_UPDATED' && newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Get profile from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      if (data) {
        setProfile(data as UserProfile);
        return data as Profile;
      } else {
        // If profile doesn't exist, create it
        const newProfile = {
          id: userId,
          username: user?.email?.split('@')[0],
          full_name: '',
          avatar_url: '',
          email: user?.email,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          is_admin: false,
          email_confirmed: false,
          debug_mode: false,
          login_count: 1,
          last_active_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return null;
        }

        setProfile(newProfile as UserProfile);
        return newProfile as Profile;
      }
    } catch (e: any) {
      console.error("Error during profile fetch:", e);
      setError(e);
      return null;
    }
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    if (user) {
      return await fetchUserProfile(user.id);
    }
    return null;
  };

  // Authentication methods
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      return { error: null, data };
    } catch (err: any) {
      toast({
        title: "Login error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "Signup successful",
        description: "Please check your email to confirm your account",
      });
      
      return { error: null, data: { ...data, redirectTo: "/confirm-email" } };
    } catch (err: any) {
      toast({
        title: "Signup error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      
      return { success: true, redirectTo: "/" };
    } catch (err: any) {
      toast({
        title: "Logout error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Reset password failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions",
      });
      
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Reset password error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        toast({
          title: "Update password failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Update password error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  // Implement the signOut function
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Provide feedback to the user
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      // Navigate to home page (this should happen in the component that calls signOut)
    } catch (e: any) {
      console.error("Error signing out:", e);
      toast({
        title: "Error signing out",
        description: e.message || "An error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        profile,
        session,
        isLoading,
        isInitialized,
        isAdmin,
        loginCount,
        lastActive,
        error,
        refreshProfile,
        signOut,
        login,
        signup,
        logout,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
