
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSignup = () => {
  const { toast } = useToast();
  const { sendEmail } = useEmail();

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please login instead.",
          variant: "destructive",
        });
        return { error: { message: "Account already exists" }, data: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        if (error.message.includes("Email signups are disabled")) {
          toast({
            title: "Email authentication disabled",
            description: "Email registration is currently disabled in this application. Please contact the administrator.",
            variant: "destructive",
          });
          return { error, data: null };
        }
        
        throw error;
      }
      
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { error: tokenError } = await supabase
        .from('verification_tokens')
        .insert({ 
          user_email: email, 
          token: verificationToken, 
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });
      
      if (tokenError) {
        console.error('Error storing verification token:', tokenError);
      }
      
      const BASE_URL = "https://codecove.dev";
      const verificationApiUrl = `${BASE_URL}/api/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      console.log("Generated verification URL:", verificationApiUrl);
      
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: "Welcome to Surrendered Sinner - Please Verify Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h1 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Welcome to Surrendered Sinner</h1>
              <p>Hi ${fullName},</p>
              <p>Thank you for signing up for Surrendered Sinner. We're excited to have you join our elite fitness coaching platform.</p>
              <p>Before you can access your account, please verify your email address by clicking the link below:</p>
              <p style="text-align: center;">
                <a href="${verificationApiUrl}" 
                   style="background-color: #e32400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                  Verify My Email
                </a>
              </p>
              <p>If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
              <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${verificationApiUrl}
              </p>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not sign up for this account, please ignore this email.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
                <p>Surrendered Sinner Elite Fitness Coaching</p>
                <p>&copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        
        console.log('Verification email sent successfully to:', email, emailResult);
        
        if (!emailResult.success) {
          console.error('Email sending failed with response:', emailResult);
          toast({
            title: "Warning",
            description: "Account created but verification email could not be sent. Please contact support.",
            variant: "destructive",
          });
        }
      } catch (emailError: any) {
        console.error('Error sending verification email:', emailError);
        toast({
          title: "Warning",
          description: "Account created but verification email could not be sent. Please contact support.",
          variant: "destructive",
        });
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });
      
      // Return data with a redirectTo property to show the dialog instead of a page
      return { 
        error: null, 
        data: { 
          user: data.user, 
          session: data.session, 
          emailSent: true,
          redirectTo: "/confirm-email", 
          redirectState: { email }
        } 
      };
    } catch (error: any) {
      console.error('Signup error:', error.message);
      toast({
        title: "Signup failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  return {
    signup
  };
};
