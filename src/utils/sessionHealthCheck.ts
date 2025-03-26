
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Monitors session health and attempts to refresh the session if issues are detected
 * @returns A cleanup function to stop monitoring
 */
export const startSessionHealthMonitoring = (): () => void => {
  let isRefreshing = false;
  const checkInterval = 30000; // Check every 30 seconds
  
  const timer = setInterval(async () => {
    if (isRefreshing || document.hidden) return;
    
    try {
      isRefreshing = true;
      
      // Check if we have a session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session health check error:', error);
        await attemptSessionRefresh();
      } else if (!data.session) {
        console.log('No active session found during health check');
      }
      
      isRefreshing = false;
    } catch (err) {
      console.error('Session health check exception:', err);
      isRefreshing = false;
    }
  }, checkInterval);
  
  return () => clearInterval(timer);
};

/**
 * Attempts to refresh the session
 */
const attemptSessionRefresh = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }
    
    if (data.session) {
      console.log('Session successfully refreshed');
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Session refresh exception:', err);
    return false;
  }
};

/**
 * Checks that the current auth session is valid and refreshes if needed
 * @returns True if session is valid
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    // First try to get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error validating session:', error);
      return false;
    }
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // Check if the token is about to expire (within 5 minutes)
    const expiresAt = session?.expires_at;
    if (expiresAt) {
      const expiryTime = expiresAt * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      // If token expires within 5 minutes, refresh it
      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log('Token expires soon, refreshing...');
        return await attemptSessionRefresh();
      }
    }
    
    return true;
  } catch (err) {
    console.error('Session validation exception:', err);
    return false;
  }
};

/**
 * Call this when a server request fails with a 401 error
 * to attempt to recover the session
 */
export const handleAuthError = async (): Promise<boolean> => {
  toast({
    title: "Session expired",
    description: "Attempting to restore your session...",
    variant: "default"
  });
  
  const refreshed = await attemptSessionRefresh();
  
  if (refreshed) {
    toast({
      title: "Session restored",
      description: "Your session has been successfully restored",
      variant: "default"
    });
    return true;
  } else {
    toast({
      title: "Authentication required",
      description: "Please log in again to continue",
      variant: "destructive"
    });
    return false;
  }
};
