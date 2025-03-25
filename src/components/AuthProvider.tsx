
import React, { ReactNode, createContext, useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';

// Helper for conditional logging
const isDev = import.meta.env.DEV;
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) console.debug(`[AuthProvider] ${message}`, ...args);
};

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null; data: any | null }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ 
    error: any | null, 
    data: any | null 
  }>;
  logout: () => Promise<{ success: boolean; redirectTo?: string }>;
  refreshProfile: () => Promise<Profile | null>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: any | null }>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Track auth operations
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  // This function will fetch the profile data when a user is authenticated
  const fetchProfile = async (currentUser: User) => {
    try {
      logDebug('Fetching profile for user:', currentUser.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (data) {
        logDebug('Profile loaded:', data);
        setIsAdmin(!!data.is_admin);
        setProfile(data);
        return data;
      }
      
      // Create a basic profile if one doesn't exist
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
        console.error('Error creating profile:', createError);
        return null;
      }
      
      logDebug('Created new profile:', newProfile);
      setIsAdmin(!!newProfile.is_admin);
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Handle login
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) return { error, data: null };
      
      if (data.user) {
        const profileData = await fetchProfile(data.user);
        return { error: null, data: { user: data.user, session: data.session, profile: profileData } };
      }
      
      return { error: null, data };
    } catch (error: any) {
      return { error, data: null };
    }
  };

  // Handle signup
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
      
      if (error) return { error, data: null };
      
      return { error: null, data };
    } catch (error: any) {
      return { error, data: null };
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Clear all auth-related data from localStorage
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('supabase') || 
          key === 'supabase_session' ||
          key === 'minimal_session_data' ||
          key.startsWith('sb-') || 
          key.includes('auth')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear auth-related cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name && (
          name.includes('auth') || 
          name.includes('supabase') || 
          name.startsWith('sb-')
        )) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      return { success: true, redirectTo: '/login' };
    } catch (error: any) {
      console.error('Logout error:', error.message);
      return { success: false };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Refresh profile
  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      const profileData = await fetchProfile(user);
      return profileData;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        logDebug('Initializing auth');
        
        // First set up the auth state listener
        if (authSubscription.current) {
          authSubscription.current.unsubscribe();
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            logDebug('Auth state changed:', event);
            
            // Update session state
            setSession(currentSession);
            
            // Update user state
            const currentUser = currentSession?.user ?? null;
            setUser(currentUser);
            
            // If we have a user, fetch their profile
            if (currentUser) {
              await fetchProfile(currentUser);
            } else {
              setProfile(null);
              setIsAdmin(false);
            }
          }
        );
        
        authSubscription.current = subscription;
        
        // Then check if we have an existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        // Update session state
        setSession(currentSession);
        
        // Update user state
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        
        // If we have a user, fetch their profile
        if (currentUser) {
          await fetchProfile(currentUser);
        }
        
        setIsInitialized(true);
        setIsLoading(false);
        
        logDebug('Auth initialized', { user: !!currentUser, session: !!currentSession });
        
        // Set up session refresh
        const refreshInterval = setInterval(async () => {
          if (!document.hidden) { // Only refresh when tab is visible
            try {
              const { data } = await supabase.auth.getSession();
              if (data.session) {
                await supabase.auth.refreshSession();
              }
            } catch (err) {
              console.error("Error refreshing session:", err);
            }
          }
        }, 4 * 60 * 1000); // Refresh every 4 minutes
        
        return () => clearInterval(refreshInterval);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, []);

  // While loading, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Provide auth context
  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    isInitialized,
    login,
    signup,
    logout,
    refreshProfile,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
