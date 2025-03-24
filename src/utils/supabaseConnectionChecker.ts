
import { supabase } from "@/integrations/supabase/client";

/**
 * Health check for Supabase connection
 * @returns {Promise<boolean>} True if connection is healthy
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to check connection
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
 * @returns {Promise<boolean>} True if reconnection successful
 */
export const attemptSupabaseReconnection = async (maxRetries: number = 3): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`Attempting to reconnect to Supabase (attempt ${i + 1}/${maxRetries})...`);
    
    // Force refresh the Supabase session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (!error) {
      // Test the connection with a simple query
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        console.log("Supabase reconnection successful");
        return true;
      }
    }
    
    // Wait before retry (exponential backoff)
    const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  console.error("All Supabase reconnection attempts failed");
  return false;
};
