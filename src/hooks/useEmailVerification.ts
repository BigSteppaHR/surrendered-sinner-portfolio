
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
        subject: "Surrendered Sinner - Email Verification Reminder",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Verify Your Email</h1>
            <p>Hi there,</p>
            <p>You requested a new verification link for your Surrendered Sinner account. Please verify your email address by clicking the link below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" 
                 style="background-color: #e32400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                Verify My Email
              </a>
            </p>
            <p>If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            <p>This link will expire in 24 hours.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
              <p>Surrendered Sinner Elite Fitness Coaching</p>
              <p>&copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.</p>
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
