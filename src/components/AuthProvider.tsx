
import React, { ReactNode, createContext, useState, useEffect, useRef } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/auth';
import { AuthContextType } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Helper for conditional logging
const isDev = import.meta.env.DEV;
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) console.debug(`[AuthProvider] ${message}`, ...args);
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get auth state and operations from custom hooks
  const authState = useAuthState();
  const authOperations = useAuthOperations();
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAttempted = useRef(false);
  const sessionRefreshInterval = useRef<number | null>(null);
  const authLoaded = useRef(false);
  const isRefreshingProfile = useRef(false);
  const pendingTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Setup supabase client and initialize session
  useEffect(() => {
    // Initialize auth session only once
    const initializeAuth = async () => {
      if (initializeAttempted.current) return;
      
      initializeAttempted.current = true;
      
      try {
        logDebug('Initializing auth provider...');
        
        // Set up the auth state listener first to catch any events during initialization
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            logDebug('Auth state changed:', event, session ? 'Session active' : 'No session');
            
            // Don't try to refresh profile during initialization to avoid loops
            if (session?.user && authLoaded.current && !isRefreshingProfile.current) {
              // Set a debounce to avoid rapid refresh calls
              isRefreshingProfile.current = true;
              
              // Create a timeout but don't return it - instead store it for cleanup
              const timeoutId = setTimeout(async () => {
                try {
                  await authState.refreshProfile();
                } catch (error) {
                  console.error("Error refreshing profile:", error);
                } finally {
                  isRefreshingProfile.current = false;
                }
              }, 300);
              
              // Store timeout for later cleanup
              pendingTimeouts.current.push(timeoutId);
            }
          }
        );
        
        // Get session to ensure we have the most up-to-date state
        const { data } = await supabase.auth.getSession();
        logDebug('Current session:', data.session ? 'Active' : 'None');
        
        // If session exists, refresh profile data
        if (data.session?.user) {
          try {
            isRefreshingProfile.current = true;
            await authState.refreshProfile();
            isRefreshingProfile.current = false;
          } catch (error) {
            console.error("Error refreshing initial profile:", error);
            isRefreshingProfile.current = false;
          }
        }
        
        // Always mark as initialized and loaded even if there's no session
        setIsInitialized(true);
        authLoaded.current = true;
        
        // Set up automatic session refresh with a more conservative interval
        if (sessionRefreshInterval.current) {
          clearInterval(sessionRefreshInterval.current);
          sessionRefreshInterval.current = null;
        }
        
        // Only set up refreshing if there's an active session
        if (data.session) {
          // Calculate refresh time - refresh when 80% of the session lifetime has passed
          // Default Supabase JWT lifetime is 1 hour (3600 seconds)
          const refreshInterval = Math.floor(3600 * 0.8) * 1000; // 80% of session lifetime in ms
          
          sessionRefreshInterval.current = window.setInterval(async () => {
            if (!document.hidden) { // Only refresh when tab is visible
              try {
                // Check if we still have a session before attempting refresh
                const { data: currentSession } = await supabase.auth.getSession();
                if (currentSession.session) {
                  logDebug("Refreshing session at", new Date().toISOString());
                  const { data, error } = await supabase.auth.refreshSession();
                  if (error) {
                    console.error("Session refresh failed:", error);
                  } else if (data.session) {
                    logDebug("Session refreshed successfully at", new Date().toISOString());
                  }
                } else {
                  logDebug("No active session to refresh");
                  // Clear the interval if there's no session
                  if (sessionRefreshInterval.current) {
                    clearInterval(sessionRefreshInterval.current);
                    sessionRefreshInterval.current = null;
                  }
                }
              } catch (err) {
                console.error("Error in refresh interval:", err);
              }
            }
          }, refreshInterval || 4 * 60 * 1000); // Fallback to 4 minutes if calculation fails
          
          logDebug(`Session refresh interval set for ${refreshInterval / 1000} seconds`);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true); // Still mark as initialized to not block the UI
        authLoaded.current = true;
      }
    };

    initializeAuth();

    // Clean up all pending timeouts and intervals when unmounting
    return () => {
      // Clear all pending timeouts
      pendingTimeouts.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      pendingTimeouts.current = [];
      
      // Clear session refresh interval
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
