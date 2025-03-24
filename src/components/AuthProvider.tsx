
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
  const sessionRefreshInterval = useRef<number | null>(null);

  // Setup supabase client and initialize session
  useEffect(() => {
    // Initialize auth session only once
    const initializeAuth = async () => {
      if (initializeAttempted.current) return;
      
      initializeAttempted.current = true;
      
      try {
        console.log('Initializing auth provider...');
        
        // Set up the auth state listener first to catch any events during initialization
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session ? 'Session active' : 'No session');
            
            // Trigger a profile refresh when authentication state changes
            if (session?.user) {
              await authState.refreshProfile();
            }
          }
        );
        
        // Get session to ensure we have the most up-to-date state
        const { data } = await supabase.auth.getSession();
        console.log('Current session:', data.session ? 'Active' : 'None');
        
        // Always mark as initialized even if there's no session
        setIsInitialized(true);
        
        // Set up automatic session refresh - use a more conservative interval
        if (sessionRefreshInterval.current) {
          clearInterval(sessionRefreshInterval.current);
        }
        
        // Only set up refreshing if there's an active session
        if (data.session) {
          // Calculate refresh time - refresh when 80% of the session lifetime has passed
          // Default Supabase JWT lifetime is 1 hour (3600 seconds)
          const refreshInterval = Math.floor(3600 * 0.8) * 1000; // 80% of session lifetime in ms
          
          sessionRefreshInterval.current = window.setInterval(async () => {
            try {
              // Check if we still have a session before attempting refresh
              const { data: currentSession } = await supabase.auth.getSession();
              if (currentSession.session) {
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                  console.error("Session refresh failed:", error);
                } else if (data.session) {
                  console.log("Session refreshed successfully at", new Date().toISOString());
                }
              } else {
                console.log("No active session to refresh");
                // Clear the interval if there's no session
                if (sessionRefreshInterval.current) {
                  clearInterval(sessionRefreshInterval.current);
                  sessionRefreshInterval.current = null;
                }
              }
            } catch (err) {
              console.error("Error in refresh interval:", err);
            }
          }, refreshInterval || 4 * 60 * 1000); // Fallback to 4 minutes if calculation fails
          
          console.log(`Session refresh interval set for ${refreshInterval / 1000} seconds`);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true); // Still mark as initialized to not block the UI
      }
    };

    initializeAuth();

    return () => {
      if (sessionRefreshInterval.current) {
        clearInterval(sessionRefreshInterval.current);
        sessionRefreshInterval.current = null;
      }
    };
  }, [authState]);

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
