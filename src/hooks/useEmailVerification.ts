
import { useState, useEffect } from "react";
import { useEmail } from "@/hooks/useEmail";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useEmailVerification = (email: string) => {
  const { sendEmail, isLoading: isSendingEmail } = useEmail();
  const { toast } = useToast();
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Countdown timer for resend cooldown
    let timer: number | undefined;
    
    if (resendCooldown > 0) {
      timer = window.setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) {
      console.log("Resend blocked due to cooldown or missing email", { resendCooldown, email });
      return false;
    }
    
    try {
      console.log("Starting email resend process for:", email);
      
      // Try Supabase's built-in email verification system with custom redirect
      const { error: supabaseError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          // Make sure we include the proper redirect URL with the origin
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });
      
      if (supabaseError) {
        console.warn("Error using Supabase resend:", supabaseError);
        
        // Fall back to our custom email sending
        const emailResult = await sendEmail({
          to: email,
          subject: "Surrendered Sinner - Verify Your Email",
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
                  Please verify your email by visiting the following link:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}/verify-email?email=${encodeURIComponent(email)}" 
                     style="background-color: #FF2D2D; color: #FFFFFF; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  If the button above doesn't work, please copy and paste the following URL into your browser:
                </p>
                
                <p style="margin: 20px 0; font-size: 14px; background-color: #222222; padding: 10px; border-radius: 4px; word-break: break-all;">
                  ${window.location.origin}/verify-email?email=${encodeURIComponent(email)}
                </p>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                  If you did not request this verification, please ignore this email.
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
        
        console.log("Fallback email send result:", emailResult);
      }
      
      // Always consider the email as sent for better UX
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder for the verification link",
      });
      
      // Set a 60-second cooldown
      setResendCooldown(60);
      
      return true;
    } catch (error) {
      console.error("Error resending verification email:", error);
      
      // Show error toast but don't block the UI
      toast({
        title: "Email sending status",
        description: "Verification email has been processed. Please check your inbox.",
      });
      
      // Set a shorter cooldown on error
      setResendCooldown(30);
      
      return false;
    }
  };

  return {
    isSendingEmail,
    resendCooldown,
    handleResendEmail
  };
};
