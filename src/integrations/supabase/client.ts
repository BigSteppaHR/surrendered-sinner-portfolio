
import { createClient } from '@supabase/supabase-js';

// Get the environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tcxwvsyfqjcgglyqlahl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHd2c3lmcWpjZ2dseXFsYWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODM2MjEsImV4cCI6MjA1ODM1OTYyMX0.lGygYfHKmfuTlS-B0-AiU8Y7iHfIGxM5dTfxhId6O9c';

// Create supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  },
  global: {
    // Add default headers to all requests to fix 406 errors
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
});

export default supabase;
