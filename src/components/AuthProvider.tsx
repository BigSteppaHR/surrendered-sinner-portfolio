
import React, { ReactNode, createContext, useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  loginCount: number;
  lastActive: Date | null;
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
  const { toast } = useToast();
  
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

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
        
        try {
          await supabase
            .from('profiles')
            .update({
              last_active_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
            
          logDebug('Updated last active time');
        } catch (updateError) {
          console.error('Error updating last active time:', updateError);
        }
        
        return data;
      }
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          email_confirmed: !!currentUser.email_confirmed_at,
          updated_at: new Date().toISOString(),
          login_count: 1,
          last_active_at: new Date().toISOString()
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

  const logout = async () => {
    try {
      logDebug('Attempting to log out user...');
      
      // Sign out from Supabase auth with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error from Supabase:', error);
        throw error;
      }
      
      logDebug('Successfully logged out from Supabase');
      
      // Clear auth state
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
      
      // Clear auth cookies
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
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      return { success: true, redirectTo: '/login' };
    } catch (error: any) {
      console.error('Logout error:', error.message);
      
      toast({
        title: "Logout failed",
        description: error.message || "There was a problem logging out",
        variant: "destructive",
      });
      
      return { success: false };
    }
  };

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

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Important: Set up auth listener BEFORE checking session
        logDebug('Setting up auth state listener');
        
        if (authSubscription.current) {
          authSubscription.current.unsubscribe();
        }
        
        // First: set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            logDebug('Auth state changed:', event, currentSession?.user?.email);
            
            if (currentSession) {
              setSession(currentSession);
              setUser(currentSession.user);
              
              if (currentSession.user) {
                await fetchProfile(currentSession.user);
              }
            } else {
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsAdmin(false);
            }
          }
        );
        
        authSubscription.current = subscription;
        
        // Then: check for an existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        logDebug('Existing session check:', !!currentSession);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          if (currentSession.user) {
            await fetchProfile(currentSession.user);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsInitialized(true);
        setIsLoading(false);
        
        // Set up a session refresh timer
        const refreshInterval = setInterval(async () => {
          if (!document.hidden) {
            try {
              const { data } = await supabase.auth.getSession();
              if (data.session) {
                // Refresh the session if it exists
                await supabase.auth.refreshSession();
                logDebug('Session refreshed');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    isInitialized,
    loginCount: profile?.login_count || 0,
    lastActive: profile?.last_active_at ? new Date(profile?.last_active_at) : null,
    login,
    signup,
    logout,
    refreshProfile,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
