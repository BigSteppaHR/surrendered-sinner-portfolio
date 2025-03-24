
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';

export const useAuthLogin = () => {
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Fetch profile to check email confirmation status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

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
            ...data, 
            redirectTo: '/dashboard',
            profile: null
          } 
        };
      }

      if (!profile?.email_confirmed) {
        console.log('Email not confirmed for user:', email);
        // If email is not confirmed, sign out immediately
        await supabase.auth.signOut();
        
        // Return the error with state data for email verification dialog
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
      }

      // Return navigation data for confirmed users
      console.log('Login successful, confirmed user:', email);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      return { 
        error: null, 
        data: { 
          ...data, 
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

  // This refreshProfile function should return the Profile object to match the type definition
  const refreshProfile = async (): Promise<Profile | null> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session.session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.session.user.id)
          .single();
        
        if (error) {
          console.error('Error refreshing profile:', error.message);
          return null;
        }
        
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
