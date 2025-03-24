
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

/**
 * Health check for Supabase connection
 * @returns {Promise<boolean>} True if connection is healthy
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to check connection using the newly indexed profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      console.error("Supabase connection error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to check Supabase connection:", error);
    return false;
  }
};

/**
 * Attempts to reconnect to Supabase
 * @param maxRetries Maximum number of retry attempts
 * @param notifyUser Whether to show toast notifications to the user
 * @returns {Promise<boolean>} True if reconnection successful
 */
export const attemptSupabaseReconnection = async (
  maxRetries: number = 3,
  notifyUser: boolean = true
): Promise<boolean> => {
  if (notifyUser) {
    toast({
      title: "Connection Issue",
      description: "Trying to reconnect to the server...",
      variant: "default"
    });
  }
  
  for (let i = 0; i < maxRetries; i++) {
    console.log(`Attempting to reconnect to Supabase (attempt ${i + 1}/${maxRetries})...`);
    
    // Force refresh the Supabase session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (!error) {
      // Test the connection with a simple query
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        console.log("Supabase reconnection successful");
        
        if (notifyUser) {
          toast({
            title: "Reconnected",
            description: "Successfully reconnected to the server",
            variant: "default"
          });
        }
        
        return true;
      }
    }
    
    // Wait before retry (exponential backoff)
    const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  console.error("All Supabase reconnection attempts failed");
  
  if (notifyUser) {
    toast({
      title: "Connection Failed",
      description: "Could not reconnect to the server. Please check your internet connection and try again.",
      variant: "destructive"
    });
  }
  
  return false;
};

/**
 * Monitors connection health and attempts reconnection if needed
 * @returns A cleanup function to stop the monitoring
 */
export const startConnectionMonitoring = (): () => void => {
  let isReconnecting = false;
  const interval = 30000; // Check every 30 seconds
  
  const timer = setInterval(async () => {
    // Skip if already attempting reconnection
    if (isReconnecting) return;
    
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      isReconnecting = true;
      await attemptSupabaseReconnection(3, false);
      isReconnecting = false;
    }
  }, interval);
  
  return () => clearInterval(timer);
};
