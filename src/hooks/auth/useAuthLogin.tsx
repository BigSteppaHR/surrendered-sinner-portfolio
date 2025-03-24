
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

      // Return navigation data instead of using navigate directly
      const redirectData = {
        redirectTo: profile?.email_confirmed ? '/dashboard' : '/confirm-email',
        redirectState: { email }
      };

      return { error: null, data: { ...data, ...redirectData } };
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

  const refreshProfile = async () => {
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
