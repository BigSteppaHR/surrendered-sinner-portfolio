
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';
import { fetchUserProfile } from '@/services/userAccountService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loginCount: number;
  lastActive: Date | null;
  login: (email: string, password: string) => Promise<{ error: any | null, data: any | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: any | null, data: any | null }>;
  logout: () => Promise<{ success: boolean, redirectTo?: string }>;
  refreshProfile: () => Promise<Profile | null>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: any | null }>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loginCount: 0,
  lastActive: null,
  login: async () => ({ error: null, data: null }),
  signup: async () => ({ error: null, data: null }),
  logout: async () => ({ success: false }),
  refreshProfile: async () => null,
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Connect any pending quiz results to the user
  const connectQuizResultsToUser = async (userId: string) => {
    try {
      const pendingQuizConnection = sessionStorage.getItem('pendingQuizConnection');
      if (!pendingQuizConnection) return;
      
      const { resultId } = JSON.parse(pendingQuizConnection);
      if (!resultId) return;
      
      console.log('Connecting quiz result to user:', resultId);
      
      // Update the quiz result with the user ID
      const { error: updateError } = await supabase
        .from('custom_plan_results')
        .update({ user_id: userId })
        .eq('id', resultId);
      
      if (updateError) throw updateError;
      
      // Create workout plan from the quiz result
      const { data: workoutPlan, error: workoutError } = await supabase
        .rpc('add_custom_plan_to_workout_plans', {
          p_user_id: userId,
          p_custom_plan_result_id: resultId
        });
      
      if (workoutError) throw workoutError;
      
      // Clear stored quiz data
      sessionStorage.removeItem('pendingQuizConnection');
      sessionStorage.removeItem('pendingQuizData');
      
      toast({
        title: "Custom Plan Ready",
        description: "Your personalized training plan is now available in your dashboard"
      });
      
    } catch (error: any) {
      console.error('Error connecting quiz results:', error);
    }
  };

  // Fetch the user profile if we have a user
  const fetchProfile = async (userId: string) => {
    try {
      const { profile, error } = await fetchUserProfile(userId);
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (profile) {
        setProfile(profile);
        
        // Check for and connect any pending quiz results
        connectQuizResultsToUser(userId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      const { profile, error } = await fetchUserProfile(user.id);
      
      if (error) {
        console.error('Error refreshing profile:', error);
        return null;
      }
      
      if (profile) {
        setProfile(profile);
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Error in refreshProfile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
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
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error logging out:', error);
        return { success: false };
      }
      
      return { success: true, redirectTo: '/' };
    } catch (error) {
      console.error('Error in logout:', error);
      return { success: false };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log('Auth state changed:', event);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              // Use setTimeout to avoid potential deadlocks with Supabase client
              setTimeout(() => {
                fetchProfile(currentSession.user.id);
              }, 0);
            } else {
              setProfile(null);
            }
          }
        );
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
        
        setIsInitialized(true);
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Calculate derived properties
  const isAuthenticated = !!user;
  const isAdmin = !!profile?.is_admin;
  const loginCount = profile?.login_count || 0;
  const lastActive = profile?.last_active_at ? new Date(profile.last_active_at) : null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isInitialized,
        user,
        session,
        profile,
        isAdmin,
        loginCount,
        lastActive,
        login,
        signup,
        logout,
        refreshProfile,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
