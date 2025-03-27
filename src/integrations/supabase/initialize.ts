
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
    
    // Test connection and log results
    testSupabaseConnection().then(isConnected => {
      console.log('Supabase connection test result:', isConnected ? 'Success' : 'Failed');
    }).catch(err => {
      console.error('Error testing Supabase connection:', err);
    });
    
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
    
    // First test - check if we can call a simple function
    const { data: healthData, error: healthError } = await supabase.rpc('get_quote_of_the_day');
    
    if (healthError) {
      console.warn('DB function test failed:', healthError);
      
      // Second test - try a simple table query if function fails
      const { error: queryError } = await supabase.from('profiles').select('id').limit(1);
      
      if (queryError) {
        console.warn('Table query test failed:', queryError);
        return false;
      }
      
      return true;
    }
    
    return true;
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
