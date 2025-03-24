
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle profile updates
  const refreshProfileData = async (currentUser: User | null) => {
    if (!currentUser) return null;
    
    try {
      // Use the email to query the profile, as the ID might not match in some cases
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        
        // If no profile exists for this user ID, try to create one
        if (error.message.includes('multiple (or no) rows returned')) {
          const email = currentUser.email;
          if (email) {
            console.log('No profile found, checking if one exists with this email');
            
            // First check if a profile exists with this email
            const { data: emailProfileData, error: emailProfileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', email)
              .maybeSingle();
              
            if (emailProfileError) {
              console.error('Error checking email profile:', emailProfileError.message);
              
              // Still try to create a new profile even if there was an error checking
              console.log('Creating new profile despite previous errors');
              
              // Create a new profile for this user
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([
                  { 
                    id: currentUser.id, 
                    email: email,
                    email_confirmed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                ])
                .select()
                .single();
                
              if (createError) {
                console.error('Error creating profile:', createError.message);
                return null;
              }
              
              return newProfile;
            }
            
            if (emailProfileData) {
              console.log('Found profile with matching email, updating its ID');
              
              // Update the existing profile with the correct user ID
              const { error: updateError, data: updatedProfile } = await supabase
                .from('profiles')
                .update({ 
                  id: currentUser.id,
                  updated_at: new Date().toISOString()
                })
                .eq('email', email)
                .select()
                .single();
                
              if (updateError) {
                console.error('Error updating profile ID:', updateError.message);
                return emailProfileData; // Return the existing profile data even if update failed
              }
              
              return updatedProfile || emailProfileData;
            } else {
              console.log('No profile found, creating new profile');
              
              // Create a new profile for this user
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([
                  { 
                    id: currentUser.id, 
                    email: email,
                    email_confirmed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                ])
                .select()
                .single();
                
              if (createError) {
                console.error('Error creating profile:', createError.message);
                return null;
              }
              
              return newProfile;
            }
          }
        }
        
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error('Exception fetching profile:', error.message);
      return null;
    }
  };

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const profileData = await refreshProfileData(currentSession.user);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    // Then initialize the auth state
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        console.log('Initializing auth state...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session:', currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const profileData = await refreshProfileData(currentSession.user);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // This public refreshProfile function matches the expected signature in AuthContextType
  const refreshProfile = async (): Promise<Profile | null> => {
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
