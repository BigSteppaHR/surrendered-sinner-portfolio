
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Profile creation response type
export interface ProfileCreationResult {
  success: boolean;
  error?: any;
}

// Authentication result type
export interface AuthResult {
  user?: User | null;
  session?: Session | null;
  error?: any;
}

// Check if user already exists
export const checkExistingUser = async (email: string): Promise<boolean> => {
  try {
    const { data: existingUser, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking existing user:', error);
    }
    
    return !!existingUser;
  } catch (error) {
    console.error('Exception checking existing user:', error);
    return false;
  }
};

// Create user in Supabase Auth
export const createAuthUser = async (
  email: string, 
  password: string, 
  fullName: string
): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          email: email,
        },
      },
    });

    if (error) {
      return { error };
    }

    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Error creating auth user:', error);
    return { error };
  }
};

// Create or update user profile
export const createUserProfile = async (
  userId: string, 
  email: string, 
  fullName: string
): Promise<ProfileCreationResult> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId,
        email: email,
        full_name: fullName,
        email_confirmed: false
      }, { onConflict: 'id' });
      
    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error("Exception updating profile:", error);
    return { success: false, error };
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error signing out user:", error);
  }
};

// Authenticate user with email and password
export const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log('Attempting to authenticate user:', email);
    
    // Add a small delay before authentication to ensure any previous auth operations are completed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { error };
  }
};

// Fetch user profile by ID
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return { profile: null, error };
    }

    return { profile, error: null };
  } catch (error) {
    console.error('Exception in fetchUserProfile:', error);
    return { profile: null, error };
  }
};
