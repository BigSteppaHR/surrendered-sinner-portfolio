
import React, { ReactNode, createContext, useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/auth';
import { AuthContextType } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get auth state and operations from custom hooks
  const authState = useAuthState();
  const authOperations = useAuthOperations();
  const [isInitialized, setIsInitialized] = useState(false);

  // Setup supabase client to use localStorage
  useEffect(() => {
    // Initialize auth session
    const initializeAuth = async () => {
      try {
        // Get session first to ensure we have the most up-to-date state
        await supabase.auth.getSession();
        
        // Set up automatic session refresh
        const refreshInterval = setInterval(async () => {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) console.error("Session refresh error:", error);
        }, 5 * 60 * 1000); // Refresh every 5 minutes instead of 10
        
        setIsInitialized(true);
        
        return () => clearInterval(refreshInterval);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Combine state and operations
  const value: AuthContextType = {
    ...authState,
    ...authOperations,
    // Override with the refreshProfile from authState which has the correct signature
    refreshProfile: authState.refreshProfile,
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
