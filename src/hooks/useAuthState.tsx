
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializeAttempted = useRef(false);
  const refreshProfileAttempted = useRef(false);

  // Handle profile updates
  const refreshProfileData = async (currentUser: User | null) => {
    if (!currentUser) return null;
    
    try {
      // Use the email to query the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error('Exception fetching profile:', error.message);
      return null;
    }
  };

  useEffect(() => {
    // Prevent multiple initializations which can cause loops
    if (initializeAttempted.current) return;
    initializeAttempted.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        // Set up the auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.email);
          
          // Set session and user state
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Update profile if user exists
          if (currentSession?.user) {
            const profileData = await refreshProfileData(currentSession.user);
            if (profileData) setProfile(profileData);
          } else {
            setProfile(null);
          }
          
          // Complete loading
          setIsLoading(false);
        });

        // Then get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        // Set session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Update profile if user exists
        if (currentSession?.user) {
          const profileData = await refreshProfileData(currentSession.user);
          if (profileData) setProfile(profileData);
        }
        
        // Always complete loading even if there's no session
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false); // Complete loading to not block the UI
      }
    };

    // Initialize
    initializeAuth();
  }, []);

  // This public refreshProfile function matches the expected signature in AuthContextType
  const refreshProfile = async (): Promise<Profile | null> => {
    refreshProfileAttempted.current = false; // Reset flag to allow refresh
    
    if (user) {
      const profileData = await refreshProfileData(user);
      if (profileData) {
        setProfile(profileData);
      }
      return profileData;
    }
    return null;
  };

  return {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!profile?.is_admin,
    refreshProfile,
  };
};
