
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

    // Apply auth settings
    supabase.auth.setSettings(authConfig);
    
    // Log initialization
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
};
