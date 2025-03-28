
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './useAuth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching profile:', error);
              } else {
                setProfile(profileData);
              }
            } else {
              setProfile(null);
            }
          }
        );

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(profileData);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location]);

  const isAuthenticated = !!user;
  const isAdmin = !!profile?.is_admin;
  const loginCount = profile?.login_count || 0;
  const lastActive = profile?.last_active_at ? new Date(profile.last_active_at) : null;

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Update login count and last active timestamp
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (data.user) {
        // Initialize profile with defaults
        const now = new Date().toISOString();
        setProfile({
          id: data.user.id,
          email: data.user.email,
          login_count: 1,
          last_login_at: now,
          last_active_at: now,
          email_confirmed: false,
          is_admin: false,
          full_name: fullName,
          avatar_url: null,
          username: null
        });
      }
      
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

  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user) return null;

    try {
      // Add proper headers to prevent 406 errors
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        });

      if (error) {
        console.error('Error refreshing profile:', error);
        return null;
      }

      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error('Error in refreshProfile:', error);
      return null;
    }
  };

  return {
    user,
    profile,
    session,
    isLoading,
    isInitialized,
    isAuthenticated,
    isAdmin,
    loginCount,
    lastActive,
    login,
    signup,
    logout,
    refreshProfile,
    resetPassword,
    updatePassword,
  };
};
