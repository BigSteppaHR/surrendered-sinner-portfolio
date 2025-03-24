
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/integrations/supabase/client';

export const useAuthPassword = () => {
  const { toast } = useToast();
  const { sendEmail } = useEmail();

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      try {
        await sendEmail({
          to: email,
          subject: "Reset Your Surrendered Sinner Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h1 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Reset Your Password</h1>
              <p>Hello,</p>
              <p>We received a request to reset your password for your Surrendered Sinner account.</p>
              <p>You'll receive another email shortly with a link to reset your password. If you didn't request a password reset, you can safely ignore this email.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
                <p>Surrendered Sinner Elite Fitness Coaching</p>
                <p>&copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      } catch (emailError: any) {
        console.error('Error sending reset password email:', emailError);
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      toast({
        title: "Failed to send reset email",
        description: error.message || "There was a problem sending the reset email",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error.message);
      toast({
        title: "Failed to update password",
        description: error.message || "There was a problem updating your password",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    resetPassword,
    updatePassword
  };
};
