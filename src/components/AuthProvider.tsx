
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
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  session: null,
  profile: null,
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        isInitialized,
        user,
        session,
        profile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
