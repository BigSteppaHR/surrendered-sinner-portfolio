
import { createClient } from '@supabase/supabase-js';

// Get the environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tcxwvsyfqjcgglyqlahl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHd2c3lmcWpjZ2dseXFsYWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODM2MjEsImV4cCI6MjA1ODM1OTYyMX0.lGygYfHKmfuTlS-B0-AiU8Y7iHfIGxM5dTfxhId6O9c';

// Enhanced logging for debugging
console.log('Supabase initialization values:', { 
  urlAvailable: !!supabaseUrl, 
  keyAvailable: !!supabaseAnonKey,
  urlPrefix: supabaseUrl.substring(0, 15) + '...'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  // Throw a clear error message if variables are missing
  throw new Error('Supabase configuration is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase_auth_token',
    storage: localStorage,
  },
  global: {
    // Add default headers to all requests to prevent 406 errors
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  // Improved retry and timeout settings
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add global error handler for common Supabase errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated');
  }
});

// Add a method to check connection health
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    const { error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    const connected = !error;
    console.log('Supabase connection check result:', connected);
    return connected;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};
