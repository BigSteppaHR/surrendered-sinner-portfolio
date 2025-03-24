
import React, { ReactNode, createContext, useState, useEffect, useRef } from 'react';
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
  const initializeAttempted = useRef(false);

  // Setup supabase client and initialize session
  useEffect(() => {
    // Initialize auth session only once
    const initializeAuth = async () => {
      if (initializeAttempted.current) return;
      
      initializeAttempted.current = true;
      
      try {
        console.log('Initializing auth provider...');
        // Get session first to ensure we have the most up-to-date state
        await supabase.auth.getSession();
        
        // Set up automatic session refresh - use a more conservative interval
        const refreshInterval = setInterval(async () => {
          try {
            // Only attempt to refresh if there's a session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const { data, error } = await supabase.auth.refreshSession();
              if (error) console.error("Session refresh error:", error);
            }
          } catch (err) {
            console.error("Error in refresh interval:", err);
          }
        }, 5 * 60 * 1000); // Refresh every 5 minutes
        
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
