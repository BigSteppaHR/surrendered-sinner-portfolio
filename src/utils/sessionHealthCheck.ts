
import { supabase } from '@/integrations/supabase/client';

/**
 * Monitors the health of the user's session and attempts to refresh it
 * when necessary to prevent auth state loss during app usage
 */
export const startSessionHealthMonitoring = () => {
  console.log('Starting session health monitoring');
  
  // Setup interval to periodically check session status
  const checkInterval = setInterval(async () => {
    // Skip checks when page is not visible to save resources
    if (document.visibilityState === 'hidden') return;
    
    try {
      // Check if we have a current session
      const { data } = await supabase.auth.getSession();
      const hasActiveSession = !!data.session;
      
      if (hasActiveSession) {
        // Session exists, but refresh it to ensure it stays valid
        await supabase.auth.refreshSession();
        console.debug('Session refreshed successfully');
      } else {
        console.info('No active session found during health check');
      }
    } catch (error) {
      console.error('Error during session health check:', error);
    }
  }, 4 * 60 * 1000); // Check every 4 minutes
  
  // Return cleanup function
  return () => {
    clearInterval(checkInterval);
    console.log('Session health monitoring stopped');
  };
};

/**
 * Verifies that the current auth state is valid by checking with Supabase
 * Can be used during critical operations to ensure auth is still valid
 */
export const verifyCurrentSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error verifying session:', error);
      return false;
    }
    
    return !!data.session;
  } catch (err) {
    console.error('Exception verifying session:', err);
    return false;
  }
};

