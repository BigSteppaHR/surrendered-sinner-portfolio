
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useAuth';

export const useAuthLogin = () => {
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch profile to check email confirmation status
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile?.email_confirmed) {
        // If email is not confirmed, sign out immediately
        await supabase.auth.signOut();
        
        toast({
          title: "Email not verified",
          description: "Please verify your email before logging in",
          variant: "destructive",
        });
        
        // Return navigation data to show the email verification dialog
        return { 
          error: null, 
          data: { 
            redirectTo: '/confirm-email', 
            redirectState: { email } 
          } 
        };
      }

      // Return navigation data for confirmed users
      return { 
        error: null, 
        data: { 
          ...data, 
          redirectTo: '/dashboard'
        } 
      };
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
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
