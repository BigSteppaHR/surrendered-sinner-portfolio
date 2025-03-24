
import { useState, useEffect } from "react";
import { useEmail } from "@/hooks/useEmail";
import { useToast } from "@/hooks/use-toast";
import { createVerificationToken, generateVerificationUrl } from "@/services/tokenService";

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
      return;
    }
    
    try {
      console.log("Starting email resend process for:", email);
      
      const verificationToken = await createVerificationToken(email);
      
      if (!verificationToken) {
        throw new Error("Failed to create verification token");
      }
      
      const verificationUrl = generateVerificationUrl(verificationToken, email);
      
      console.log("Generated verification URL:", verificationUrl);
      
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
                You requested a new verification link for your Surrendered Sinner account.
              </p>
              
              <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                Please verify your email address by clicking the button below:
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
      
      console.log("Email send result:", emailResult);
      
      if (emailResult.success) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link",
        });
        // Set a 60-second cooldown
        setResendCooldown(60);
      } else {
        console.error("Email sending failed:", emailResult);
        toast({
          title: "Failed to send email",
          description: "Please try again later or contact support",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return {
    isSendingEmail,
    resendCooldown,
    handleResendEmail
  };
};
