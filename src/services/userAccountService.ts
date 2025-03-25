
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';

/**
 * Authenticates a user with email and password
 */
export const authenticateUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { user: null, session: null, error };
    }
    
    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    console.error('Authentication error:', error);
    return { user: null, session: null, error };
  }
};

/**
 * Fetches a user's profile by ID
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return { profile: null, error };
    }
    
    return { profile: data as Profile, error: null };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { profile: null, error };
  }
};

/**
 * Creates or updates a user profile
 */
export const upsertUserProfile = async (profile: Partial<Profile> & { id: string }) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting profile:', error);
      return { profile: null, error };
    }
    
    return { profile: data as Profile, error: null };
  } catch (error: any) {
    console.error('Error upserting profile:', error);
    return { profile: null, error };
  }
};
