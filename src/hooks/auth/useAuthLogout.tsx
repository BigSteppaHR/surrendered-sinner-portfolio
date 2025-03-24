
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthLogout = () => {
  const { toast } = useToast();

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error.message);
      toast({
        title: "Logout failed",
        description: error.message || "There was a problem logging out",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return {
    logout
  };
};
