
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
  const profileFetchAttempted = useRef(false);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  // Handle profile updates - improved with better error handling
  const refreshProfileData = async (currentUser: User | null) => {
    if (!currentUser) return null;
    
    try {
      console.log('Refreshing profile data for user:', currentUser.id);
      
      // Try to get profile directly first
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        if (!error && data) {
          console.log('Profile found:', data);
          return data;
        }
        
        if (error && !error.message.includes('infinite recursion')) {
          console.error('Error in initial profile fetch:', error);
        }
      } catch (e) {
        console.error('Exception in initial profile fetch:', e);
      }
      
      // If we get here, either no profile exists or we hit an RLS error
      // Try to create a basic profile as fallback
      try {
        console.log('Attempting to create basic profile for user:', currentUser.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: currentUser.id,
            email: currentUser.email,
            email_confirmed: !!currentUser.email_confirmed_at,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Failed to create basic profile:', createError);
          // Return a minimal profile to prevent UI errors even if DB operation fails
          return {
            id: currentUser.id,
            email: currentUser.email,
            email_confirmed: !!currentUser.email_confirmed_at,
            is_admin: false
          };
        }
        
        console.log('Created basic profile successfully:', newProfile);
        return newProfile;
      } catch (e) {
        console.error('Exception creating basic profile:', e);
      }
      
      // Final fallback - just create a minimal profile object for the UI
      // This doesn't persist to the database but prevents UI errors
      return {
        id: currentUser.id,
        email: currentUser.email,
        email_confirmed: !!currentUser.email_confirmed_at,
        is_admin: false
      };
    } catch (error: any) {
      console.error('Exception in refreshProfileData:', error.message);
      // Return a minimal profile to prevent UI errors
      return {
        id: currentUser.id,
        email: currentUser.email,
        email_confirmed: !!currentUser.email_confirmed_at,
        is_admin: false
      };
    }
  };

  useEffect(() => {
    // Prevent multiple initializations which can cause loops
    if (initializeAttempted.current) return;
    initializeAttempted.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        setIsLoading(true);
        
        // Clean up any previous subscription
        if (authSubscription.current) {
          authSubscription.current.unsubscribe();
        }
        
        // Set up the auth state listener first
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.email);
          
          // Process synchronously to avoid race conditions
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Update profile if user exists
          if (currentSession?.user) {
            const profileData = await refreshProfileData(currentSession.user);
            if (profileData) {
              setProfile(profileData);
              console.log('Profile updated after auth state change:', profileData);
            } else {
              console.warn('No profile data available after auth state change');
            }
          } else {
            setProfile(null);
          }
          
          // Complete loading
          setIsLoading(false);
        });
        
        authSubscription.current = data.subscription;

        // Then get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        // Set session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Update profile if user exists
        if (currentSession?.user) {
          const profileData = await refreshProfileData(currentSession.user);
          if (profileData) {
            setProfile(profileData);
            console.log('Profile loaded during initialization:', profileData);
          } else {
            console.warn('No profile data available during initialization');
          }
        }
        
        // Always complete loading even if there's no session
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false); // Complete loading to not block the UI
      }
    };

    // Initialize
    initializeAuth();
    
    // Clean up subscription on unmount
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, []);

  // This public refreshProfile function matches the expected signature in AuthContextType
  const refreshProfile = async (): Promise<Profile | null> => {
    profileFetchAttempted.current = true; // Mark as attempted
    
    if (user) {
      try {
        const profileData = await refreshProfileData(user);
        if (profileData) {
          setProfile(profileData);
          return profileData;
        }
      } catch (err) {
        console.error("Error in refreshProfile:", err);
      }
    }
    return profile; // Return current profile if refresh fails
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
