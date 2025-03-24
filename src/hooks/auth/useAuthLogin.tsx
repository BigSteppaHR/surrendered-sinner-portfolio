
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/hooks/useAuth';
import { authenticateUser, fetchUserProfile } from '@/services/userAccountService';
import { supabase } from '@/integrations/supabase/client';

export const useAuthLogin = () => {
  const { toast } = useToast();

  // Handle email verification check
  const handleEmailVerification = async (email: string) => {
    console.log('Email not confirmed for user:', email);
    // Sign out immediately if email is not confirmed
    await supabase.auth.signOut();
    
    // Return error with state data for email verification dialog
    return { 
      error: { 
        message: "Your email is not verified. Please check your inbox and spam folder for the verification link.",
        code: "email_not_confirmed" 
      }, 
      data: {
        email: email,
        showVerification: true
      }
    };
  };

  // Handle successful login
  const handleSuccessfulLogin = (profile: Profile) => {
    console.log('Login successful, confirmed user');
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
  };

  // Main login function
  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      // Step 1: Authenticate the user
      const { user, session, error } = await authenticateUser(email, password);

      if (error) {
        throw error;
      }

      // Step 2: Fetch user profile to check email confirmation status
      const { profile, error: profileError } = await fetchUserProfile(user.id);

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        // Show toast but don't prevent login if profile fetch fails
        toast({
          title: "Warning",
          description: "User profile could not be loaded, but login succeeded.",
          variant: "default",
        });
        return { 
          error: null, 
          data: { 
            user,
            session, 
            redirectTo: '/dashboard',
            profile: null
          } 
        };
      }

      // Step 3: Check if email is confirmed
      if (!profile?.email_confirmed) {
        return handleEmailVerification(email);
      }

      // Step 4: Handle successful login
      handleSuccessfulLogin(profile);
      
      // Return navigation data for confirmed users
      return { 
        error: null, 
        data: { 
          user,
          session, 
          redirectTo: '/dashboard',
          profile: profile
        } 
      };
    } catch (error: any) {
      console.error('Login error:', error.message);
      
      // Handle different types of login errors
      if (error.message && (
        error.message.includes('Email not confirmed') || 
        error.message.toLowerCase().includes('email not verified')
      )) {
        return { 
          error: { 
            message: "Your email is not verified. Please check your inbox and spam folder for the verification link.",
            code: "email_not_confirmed" 
          }, 
          data: {
            email: email,
            showVerification: true
          }
        };
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      }
      
      return { error, data: null };
    }
  };

  // Refresh user profile data
  const refreshProfile = async (): Promise<Profile | null> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session.session?.user) {
        const { profile } = await fetchUserProfile(session.session.user.id);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error in refreshProfile:', error);
      return null;
    }
  };

  return {
    login,
    refreshProfile
  };
};
