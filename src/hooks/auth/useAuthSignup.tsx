
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/integrations/supabase/client';
import { createVerificationToken, generateVerificationUrl } from '@/services/tokenService';

export const useAuthSignup = () => {
  const { toast } = useToast();
  const { sendEmail } = useEmail();

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting to create account for:', email);

      // Check if user already exists first
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        console.log('User already exists:', email);
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please login instead.",
          variant: "destructive",
        });
        return { error: { message: "Account already exists" }, data: null };
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email: email, // Add email to metadata
          },
        },
      });
      
      if (error) {
        console.error('Signup error:', error.message);
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
      
      // Ensure profile is created properly with email field
      if (data.user) {
        console.log('Creating/updating profile for user:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id,
            email: email,
            full_name: fullName,
            email_confirmed: false
          }, { onConflict: 'id' });
          
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }
      
      // Create verification token
      const verificationToken = await createVerificationToken(email);
      
      if (!verificationToken) {
        console.error("Failed to create verification token");
        toast({
          title: "Warning",
          description: "Account created but could not generate verification token. Please contact support.",
          variant: "destructive",
        });
        return { 
          error: null, 
          data: { 
            user: data.user, 
            session: null, 
            emailSent: false,
            showVerification: true 
          } 
        };
      }
      
      const verificationUrl = generateVerificationUrl(verificationToken, email);
      console.log("Generated verification URL:", verificationUrl);
      
      try {
        // Store the verification token in the database
        const { error: tokenError } = await supabase
          .from('verification_tokens')
          .insert({
            token: verificationToken,
            user_email: email,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          });
          
        if (tokenError) {
          console.error("Error storing verification token:", tokenError);
        }
        
        const emailResult = await sendEmail({
          to: email,
          subject: "Welcome to Surrendered Sinner - Verify Your Email",
          html: `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #000000;">
              <!-- Header with Logo -->
              <div style="background-color: #111111; padding: 20px; text-align: center; border-bottom: 3px solid #FF2D2D;">
                <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: bold;">
                  SURRENDERED<span style="color: #FF2D2D;">SINNER</span>
                </h1>
                <p style="color: #AAAAAA; margin: 5px 0 0; font-size: 16px;">Elite Fitness Coaching</p>
              </div>
              
              <!-- Main Content -->
              <div style="background-color: #111111; color: #FFFFFF; padding: 30px 20px;">
                <h2 style="color: #FFFFFF; margin-top: 0; font-size: 22px; border-bottom: 1px solid #333333; padding-bottom: 10px;">
                  Verify Your Email
                </h2>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  Hi ${fullName},
                </p>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  Thank you for signing up with Surrendered Sinner. We're excited to have you join our elite fitness coaching platform.
                </p>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  To get started, please verify your email address by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                    style="background-color: #FF2D2D; color: white; padding: 14px 28px; text-decoration: none; 
                    border-radius: 4px; display: inline-block; font-size: 16px; font-weight: bold; text-transform: uppercase;
                    border: none;">
                    VERIFY EMAIL
                  </a>
                </div>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  If the button above doesn't work, you can copy and paste the following URL into your browser:
                </p>
                
                <div style="background-color: #222222; padding: 15px; border-radius: 4px; word-break: break-all; margin: 20px 0; font-size: 14px;">
                  ${verificationUrl}
                </div>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  This link will expire in 24 hours.
                </p>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  If you did not sign up for this account, please ignore this email.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #333333;">
                <p style="color: #777777; margin: 0 0 10px; font-size: 14px;">
                  Surrendered Sinner Elite Fitness Coaching
                </p>
                <p style="color: #777777; margin: 0; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.
                </p>
              </div>
            </div>
          `,
        });
        
        if (!emailResult.success) {
          console.error('Email sending failed with response:', emailResult);
          toast({
            title: "Warning",
            description: "Account created but verification email could not be sent. Please contact support.",
            variant: "destructive",
          });
        } else {
          console.log('Verification email sent successfully to:', email, emailResult);
        }
      } catch (emailError: any) {
        console.error('Error sending verification email:', emailError);
        toast({
          title: "Warning",
          description: "Account created but verification email could not be sent. Please contact support.",
          variant: "destructive",
        });
      }
      
      // Always sign the user out after signup to require email verification
      await supabase.auth.signOut();
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });
      
      return { 
        error: null, 
        data: { 
          user: data.user, 
          session: null, // No active session until email verification
          emailSent: true,
          showVerification: true
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
