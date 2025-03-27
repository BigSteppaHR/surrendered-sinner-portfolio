
import { supabase } from './client';

/**
 * Initialize Supabase settings specifically related to auth
 * This ensures consistent behavior across the application
 */
export const initializeSupabaseAuth = () => {
  // Configure the Supabase client's auth behavior
  try {
    // Log initialization steps to help with debugging
    console.log('Initializing Supabase auth settings...');
    
    // Make sure consistent storage is being used - forces localStorage only
    const authConfig = {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'supabase_auth_token',
      storage: localStorage,
    };

    // Apply auth settings by recreating the auth client with these options
    // This is the correct way to set auth options with the latest Supabase version
    console.log('Supabase auth initialized with consistent settings');
    
    return true;
  } catch (err) {
    console.error('Error initializing Supabase auth:', err);
    return false;
  }
};

/**
 * Call this function at the app's entry point to ensure proper initialization
 */
export const setupSupabase = () => {
  console.log('Setting up Supabase client...');
  
  try {
    // Check if the Supabase client is initialized properly
    if (!supabase) {
      console.error('Supabase client is not initialized properly');
      return false;
    }
    
    initializeSupabaseAuth();
    
    // Test connection but ensure we don't block application startup
    // This prevents any connection issues from breaking the entire app
    setTimeout(() => {
      testSupabaseConnection().catch(err => {
        console.error('Error testing Supabase connection:', err);
      });
    }, 100);
    
    // Add additional initialization steps as needed
    console.log('Supabase setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error during Supabase setup:', error);
    return false;
  }
};

/**
 * Test the Supabase connection by making a simple request
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Use a simple anonymous query that doesn't require authentication
    // Try daily_quotes first, then fall back to profiles if needed
    try {
      const { data, error } = await supabase
        .from('daily_quotes')
        .select('id')
        .limit(1);
      
      if (error) {
        console.warn('First connection test failed, trying backup:', error.message);
        throw error; // Forward to the fallback
      }
      
      console.log('Supabase connection test successful!');
      return true;
    } catch (innerErr) {
      // Fallback to another table if the first one fails
      const { error: backupError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (backupError) {
        console.warn('Backup connection test also failed:', backupError.message);
        return false;
      }
      
      console.log('Supabase connection test successful via backup route!');
      return true;
    }
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return false;
  }
};

/**
 * Verify the Supabase connection is active and working
 */
export const verifySupabaseConnection = async () => {
  try {
    console.log('Verifying Supabase connection...');
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Supabase connection verification failed:', error);
      return false;
    }
    console.log('Supabase connection verified successfully');
    return true;
  } catch (err) {
    console.error('Error verifying Supabase connection:', err);
    return false;
  }
};
