
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

  // Handle profile updates - improved with better error handling
  const refreshProfileData = async (currentUser: User | null) => {
    if (!currentUser) return null;
    
    try {
      console.log('Refreshing profile data for user:', currentUser.id);
      
      // Use the id to query the profile directly with single query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        
        // If we hit an RLS error, try to create a basic profile as fallback
        if (error.message.includes('permission denied') || error.message.includes('infinite recursion')) {
          try {
            console.log('Attempting to create basic profile due to fetch error');
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
              console.error('Failed to create fallback profile:', createError);
              return null;
            }
            
            console.log('Created basic profile successfully:', newProfile);
            return newProfile;
          } catch (e) {
            console.error('Exception creating fallback profile:', e);
            return null;
          }
        }
        
        return null;
      }
      
      console.log('Profile data fetched:', data ? 'success' : 'not found');
      
      // If profile doesn't exist but we have user, create a basic one
      if (!data && currentUser) {
        try {
          console.log('Profile not found, creating basic profile');
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
            return null;
          }
          
          console.log('Created basic profile successfully:', newProfile);
          return newProfile;
        } catch (e) {
          console.error('Exception creating basic profile:', e);
          return null;
        }
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
          
          // Process synchronously to avoid race conditions
          
          // 1. Set session and user state
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // 2. Update profile if user exists
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
          
          // 3. Complete loading
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
          if (profileData) {
            setProfile(profileData);
            console.log('Profile loaded during initialization:', profileData);
          } else {
            console.warn('No profile data available during initialization');
          }
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
    refreshProfileAttempted.current = true; // Mark as attempted
    
    if (user) {
      const profileData = await refreshProfileData(user);
      if (profileData) {
        setProfile(profileData);
        return profileData;
      }
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
