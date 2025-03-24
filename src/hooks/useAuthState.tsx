
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
  const initializeAttempted = useRef(false);
  const profileFetchAttempted = useRef(false);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  // Handle profile updates - improved with better error handling
  const refreshProfileData = async (currentUser: User | null) => {
    if (!currentUser) return null;
    
    try {
      logDebug('Refreshing profile data for user:', currentUser.id);
      
      // Try to get profile directly first
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        if (!error && data) {
          logDebug('Profile found:', data);
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
        logDebug('Attempting to create basic profile for user:', currentUser.id);
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
        
        logDebug('Created basic profile successfully:', newProfile);
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
          
          // Save session to localStorage for persistence during hard refreshes
          if (currentSession) {
            try {
              localStorage.setItem('supabase_session', JSON.stringify(currentSession));
              logDebug('Session saved to localStorage during auth change');
            } catch (e) {
              console.warn('Failed to save session to localStorage:', e);
            }
          }
          
          // Complete loading
          setIsLoading(false);
        });
        
        authSubscription.current = data.subscription;

        // Try to get session from localStorage first (faster than network request)
        try {
          const savedSession = localStorage.getItem('supabase_session');
          if (savedSession) {
            const parsedSession = JSON.parse(savedSession) as Session;
            if (parsedSession && parsedSession.expires_at) {
              // Check if session is not expired
              const expiresAt = new Date(parsedSession.expires_at * 1000);
              if (expiresAt > new Date()) {
                logDebug('Using saved session from localStorage');
                setSession(parsedSession);
                setUser(parsedSession.user);
                
                // Load profile data based on saved session
                if (parsedSession.user) {
                  const profileData = await refreshProfileData(parsedSession.user);
                  if (profileData) {
                    setProfile(profileData);
                    logDebug('Profile loaded from saved session:', profileData);
                  }
                }
              } else {
                logDebug('Saved session is expired, removing from localStorage');
                localStorage.removeItem('supabase_session');
              }
            }
          }
        } catch (e) {
          console.warn('Error reading session from localStorage:', e);
          localStorage.removeItem('supabase_session');
        }

        // THEN get the current session from Supabase (network request)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          // Save session to localStorage for persistence
          try {
            localStorage.setItem('supabase_session', JSON.stringify(currentSession));
            logDebug('Session saved to localStorage after getSession');
          } catch (e) {
            console.warn('Failed to save session to localStorage:', e);
          }
        
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
