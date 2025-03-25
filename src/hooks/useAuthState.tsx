
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';

// Helper for conditional logging
const isDev = import.meta.env.DEV;
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) console.debug(`[Auth] ${message}`, ...args);
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAttempted = useRef(false);
  const profileFetchAttempted = useRef(false);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  // Handle profile updates - improved with better error handling
  const refreshProfileData = async (currentUser: User | null) => {
    if (!currentUser) return null;
    
    try {
      logDebug('Refreshing profile data for user:', currentUser.id);
      
      // Try to get profile directly with simplified query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (!error && data) {
        logDebug('Profile found:', data);
        return data;
      }
      
      if (error) {
        console.error('Error in profile fetch:', error);
        
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') { // No rows returned
          try {
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
            } else {
              logDebug('Created basic profile successfully:', newProfile);
              return newProfile;
            }
          } catch (e) {
            console.error('Exception creating basic profile:', e);
          }
        }
      }
      
      // Final fallback - create a minimal profile object for the UI
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
        logDebug('Initializing auth state...');
        setIsLoading(true);
        
        // Clean up any previous subscription
        if (authSubscription.current) {
          authSubscription.current.unsubscribe();
        }
        
        // Set up the auth state listener first (IMPORTANT: must be before getSession)
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          logDebug('Auth state changed:', event, currentSession?.user?.email);
          
          // Process synchronously to avoid race conditions
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Update profile if user exists
          if (currentSession?.user) {
            const profileData = await refreshProfileData(currentSession.user);
            if (profileData) {
              setProfile(profileData);
              logDebug('Profile updated after auth state change:', profileData);
            } else {
              console.warn('No profile data available after auth state change');
            }
          } else {
            setProfile(null);
          }
          
          // Complete loading
          setIsLoading(false);
          setIsInitialized(true);
        });
        
        authSubscription.current = data.subscription;

        // Then get the current session from Supabase (network request)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          // Set session and user state
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Update profile if user exists
          if (currentSession?.user) {
            const profileData = await refreshProfileData(currentSession.user);
            if (profileData) {
              setProfile(profileData);
              logDebug('Profile loaded during initialization:', profileData);
            } else {
              console.warn('No profile data available during initialization');
            }
          }
        }
        
        // Always complete loading even if there's no session
        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false); // Complete loading to not block the UI
        setIsInitialized(true);
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
    isInitialized,
    isAuthenticated: !!user,
    isAdmin: !!profile?.is_admin,
    refreshProfile,
  };
};
