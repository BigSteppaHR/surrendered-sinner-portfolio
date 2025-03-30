
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './useAuth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // First check if we have a session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          // User is signed in
          setUser(currentSession.user);
          
          // Get the user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (!error && data) {
            setProfile(data);
          } else {
            console.error('Error fetching profile:', error);
            setProfile(null);
          }
        } else {
          // No user is signed in
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, updatedSession) => {
      console.log('Auth state change:', event);
      setSession(updatedSession);
      
      if (updatedSession?.user) {
        setUser(updatedSession.user);
        
        // Get the user profile on auth change
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', updatedSession.user.id)
          .single();
          
        if (!error && data) {
          setProfile(data);
        } else {
          console.error('Error fetching profile on auth change:', error);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // These derived values help avoid null checks throughout the app
  const isAuthenticated = !!user;
  const isAdmin = profile?.is_admin || false;
  const isEmailVerified = profile?.email_confirmed || false;

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('login_count')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profileData) {
          const newLoginCount = (profileData.login_count || 0) + 1;
          const now = new Date().toISOString();
          
          await supabase
            .from('profiles')
            .update({
              login_count: newLoginCount,
              last_login_at: now,
              last_active_at: now
            })
            .eq('id', data.user.id);
            
          setProfile({
            ...profile,
            id: data.user.id,
            email: data.user.email,
            login_count: newLoginCount,
            last_login_at: now,
            last_active_at: now,
            email_confirmed: true,
            is_admin: false,
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            username: profile?.username || null
          });
        }
      }
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      // Sign up with Supabase
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
      // Update last active time before logging out
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ 
            last_active_at: new Date().toISOString() 
          })
          .eq('id', user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setSession(null);
        setProfile(null);
        
        // Redirect to login page after logout
        navigate('/login');
      }
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user) return null;

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (!error && profileData) {
        setProfile(profileData);
        return profileData;
      }
      
      console.error('Error refreshing profile:', error);
      return null;
    } catch (error) {
      console.error('Exception during profile refresh:', error);
      return null;
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isEmailVerified,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile,
  };
};
