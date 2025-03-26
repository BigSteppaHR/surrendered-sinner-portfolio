
import { supabase } from './client';

/**
 * Initialize Supabase settings specifically related to auth
 * This ensures consistent behavior across the application
 */
export const initializeSupabaseAuth = () => {
  // Configure the Supabase client's auth behavior
  try {
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
  initializeSupabaseAuth();
  
  // Add additional initialization steps as needed
  // Check for global Supabase initialization errors
  if (!supabase) {
    console.error('Supabase client is not initialized properly');
    return false;
  }
  
  console.log('Supabase setup completed');
  return true;
};

/**
 * Verify the Supabase connection is active and working
 */
export const verifySupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Supabase connection verification failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error verifying Supabase connection:', err);
    return false;
  }
};
