
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/hooks/useAuth';
import { authenticateUser, fetchUserProfile, upsertUserProfile } from '@/services/userAccountService';
import { supabase } from '@/integrations/supabase/client';

export const useAuthLogin = () => {
  const { toast } = useToast();

  // Handle email verification check
  const handleEmailVerification = async (email: string) => {
    console.log('Email not confirmed for user:', email);
    // Sign out immediately if email is not confirmed
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out after email verification check:', err);
    }
    
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
        console.error('Authentication error:', error);
        
        // Handle specific auth errors
        if (error.message?.includes('Invalid login credentials')) {
          return { 
            error: { 
              message: "Invalid email or password. Please try again." 
            }, 
            data: null 
          };
        }
        
        throw error;
      }

      if (!user) {
        console.error('No user returned from authentication');
        throw new Error('Authentication failed');
      }

      console.log('User authenticated successfully:', user.email);

      // Important: Check if email is confirmed in Supabase Auth first
      if (user.email_confirmed_at) {
        console.log('Email is confirmed in Supabase Auth:', user.email_confirmed_at);
        
        // Step 2: Fetch user profile to ensure it exists
        const { profile, error: profileError } = await fetchUserProfile(user.id);

        if (profileError || !profile) {
          console.warn('Profile fetch error or missing profile, attempting to create profile');
          
          // Try to create a profile if it doesn't exist
          const { profile: newProfile } = await upsertUserProfile({
            id: user.id,
            email: user.email,
            email_confirmed: true,
            updated_at: new Date().toISOString()
          });
            
          if (newProfile) {
            console.log('Created new profile:', newProfile);
            handleSuccessfulLogin(newProfile);
            return { 
              error: null, 
              data: { 
                user,
                session,
                redirectTo: '/dashboard',
                profile: newProfile
              } 
            };
          }
        } else {
          // Ensure profile has email_confirmed = true
          if (!profile.email_confirmed) {
            const { profile: updatedProfile } = await upsertUserProfile({
              id: user.id,
              email_confirmed: true, 
              updated_at: new Date().toISOString()
            });
            
            if (updatedProfile) {
              profile.email_confirmed = true;
            }
          }
          
          handleSuccessfulLogin(profile);
          return { 
            error: null, 
            data: { 
              user,
              session,
              redirectTo: '/dashboard',
              profile
            } 
          };
        }
        
        // If we reached here, we have a confirmed email but profile issues
        // Let the user proceed to dashboard anyway
        handleSuccessfulLogin({
          id: user.id,
          email: user.email,
          email_confirmed: true,
          is_admin: false
        } as Profile);
        
        return {
          error: null,
          data: {
            user,
            session,
            redirectTo: '/dashboard'
          }
        };
      }

      // If email is not confirmed in Supabase Auth, check profile as fallback
      const { profile } = await fetchUserProfile(user.id);
      
      if (profile?.email_confirmed) {
        console.log('Email confirmed via profile but not in auth:', profile);
        
        // Profile says confirmed but auth doesn't - trust the profile and let user in
        handleSuccessfulLogin(profile);
        return { 
          error: null, 
          data: { 
            user,
            session, 
            redirectTo: '/dashboard',
            profile
          } 
        };
      }

      // Email is not confirmed, show verification dialog
      return handleEmailVerification(email);
    } catch (error: any) {
      console.error('Login error:', error.message);
      
      // Handle different types of login errors
      if (error.message && (
        error.message.includes("Email not confirmed") || 
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
