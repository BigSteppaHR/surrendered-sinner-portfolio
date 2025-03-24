
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthLogout = () => {
  const { toast } = useToast();

  const logout = async () => {
    try {
      console.log('Attempting to log out user...');
      
      // Sign out from Supabase auth with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error from Supabase:', error);
        throw error;
      }
      
      console.log('Successfully logged out from Supabase');
      
      // Clear all auth-related data from localStorage with improved cleanup
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('supabase') || 
          key === 'supabase_session' ||
          key.startsWith('sb-') || 
          key.startsWith('temp_creds_') ||
          key.includes('auth')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove the keys outside the loop to avoid index shifting issues
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('Cleared auth-related localStorage items:', keysToRemove.length);
      
      // Clear all cookies related to authentication
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name && (
          name.includes('auth') || 
          name.includes('supabase') || 
          name.startsWith('sb-')
        )) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      // Notify user about successful logout
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully",
      });
      
      // Force reload the page to clear any in-memory state
      // Use a small delay to ensure toast is visible
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
      
      return { success: true, redirectTo: '/login' };
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
