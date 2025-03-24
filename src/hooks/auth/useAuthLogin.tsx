
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile?.email_confirmed) {
        console.log('Email not confirmed for user:', email);
        // If email is not confirmed, sign out immediately
        await supabase.auth.signOut();
        
        // Show more detailed toast about email verification
        toast({
          title: "Email not verified",
          description: "Please check your inbox and spam folder for the verification email",
          variant: "destructive",
        });
        
        // Return the error instead of a redirect
        return { 
          error: { message: "Your email is not verified. Please check your inbox and spam folder for the verification link." }, 
          data: null 
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
          redirectTo: '/dashboard'
        } 
      };
    } catch (error: any) {
      console.error('Login error:', error.message);
      
      // Check if the error is about unconfirmed email
      if (error.message && error.message.includes('Email not confirmed')) {
        toast({
          title: "Email not verified",
          description: "Please check your inbox and spam folder for the verification email",
          variant: "destructive",
        });
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
    const { data: session } = await supabase.auth.getSession();
    
    if (session.session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();
      
      return profile;
    }
    return null;
  };

  return {
    login,
    refreshProfile
  };
};
