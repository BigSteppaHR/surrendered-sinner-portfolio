
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
    // Clear any previous sessions to avoid conflicts
    await supabase.auth.signOut();
    
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
    console.log(`Creating auth user with email: ${email} and name: ${fullName}`);
    
    // Ensure we're starting fresh
    await supabase.auth.signOut();
    
    // Use apikey header to ensure proper authorization
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          email: email,
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      console.error('Error creating auth user:', error);
      return { error };
    }

    console.log('Auth user created successfully:', data.user?.id);
    
    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Exception creating auth user:', error);
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
    console.log(`Creating/updating profile for user: ${userId}, ${email}, ${fullName}`);
    
    // Get the current session to use its JWT for the request
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No active session for profile creation");
      return { success: false, error: "No active session" };
    }
    
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
    
    console.log('Profile created/updated successfully');
    return { success: true };
  } catch (error) {
    console.error("Exception updating profile:", error);
    return { success: false, error };
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    console.log('Signing out user');
    await supabase.auth.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error("Error signing out user:", error);
  }
};

// Authenticate user with email and password
export const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log('Attempting to authenticate user:', email);
    
    // Reset any previous auth state to avoid conflicts
    await supabase.auth.signOut();
    
    // Add a small delay before authentication to ensure any previous auth operations are completed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Auth error:', error.message);
      return { error };
    }

    console.log('User authenticated successfully:', data.user?.email);
    
    // If successful, check if we need to update the profile
    if (data.user) {
      await refreshUserProfile(data.user.id);
    }
    
    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Exception authenticating user:', error);
    return { error };
  }
};

// Fetch user profile by ID
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    
    // Get the current session to ensure we have proper auth
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('No active session when fetching profile');
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return { profile: null, error };
    }

    console.log('Profile fetched:', profile ? 'success' : 'not found');
    return { profile, error: null };
  } catch (error) {
    console.error('Exception in fetchUserProfile:', error);
    return { profile: null, error };
  }
};

// Refresh user profile data
export const refreshUserProfile = async (userId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('No active session when refreshing profile');
      return null;
    }
    
    // Fetch the current profile
    const { profile } = await fetchUserProfile(userId);
    return profile;
  } catch (error) {
    console.error('Error refreshing profile:', error);
    return null;
  }
};
