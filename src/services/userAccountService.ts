
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
      .upsert(profile)
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

/**
 * Check if a user with the given email already exists
 */
export const checkExistingUser = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking existing user:', error);
      return false;
    }
    
    return !!data;
  } catch (error: any) {
    console.error('Error checking existing user:', error);
    return false;
  }
};

/**
 * Create a new auth user
 */
export const createAuthUser = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) {
      return { user: null, error };
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error creating auth user:', error);
    return { user: null, error };
  }
};

/**
 * Create a user profile
 */
export const createUserProfile = async (userId: string, email: string, fullName: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        email_confirmed: false,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error };
    }
    
    return { success: true, profile: data, error: null };
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out user:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error signing out user:', error);
    return { success: false, error };
  }
};
