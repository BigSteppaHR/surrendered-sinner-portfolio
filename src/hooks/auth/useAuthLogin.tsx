
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuthLogin = () => {
  const { toast } = useToast();

  const refreshProfile = async (user: User | null) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("Email logins are disabled")) {
          toast({
            title: "Email authentication disabled",
            description: "Email authentication is currently disabled in this application. Please contact the administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message || "There was a problem logging in",
            variant: "destructive",
          });
        }
        return { error };
      }
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast({
        title: "Login failed",
        description: error.message || "There was a problem logging in",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    login,
    refreshProfile,
  };
};
