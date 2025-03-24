
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, AlertTriangle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmail } from "@/hooks/useEmail";
import { supabase } from "@/integrations/supabase/client";

const ConfirmEmail = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { sendEmail, isLoading: isSendingEmail } = useEmail();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get email from location state or user object
  const email = location.state?.email || user?.email || "";

  useEffect(() => {
    // Check for user authentication and redirect if needed
    const checkAuthState = async () => {
      setIsLoading(true);
      
      try {
        // If no email available and no user is logged in, redirect to auth
        if (!email && !user) {
          navigate("/auth");
          return;
        }
        
        // If user exists, refresh profile to get latest email_confirmed status
        if (user) {
          await refreshProfile();
        }
        
        // If user has confirmed email, redirect to dashboard
        if (profile?.email_confirmed) {
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthState();
  }, [profile, user, email, navigate, refreshProfile]);

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
    if (resendCooldown > 0 || !email) return;
    
    try {
      // Generate a new verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Delete any existing tokens for this email
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('user_email', email);
      
      // Store the new token in Supabase
      await supabase
        .from('verification_tokens')
        .insert({ 
          user_email: email, 
          token: verificationToken, 
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });
      
      const BASE_URL = window.location.origin;
      const verificationApiUrl = `${BASE_URL}/api/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      console.log("Generated verification URL:", verificationApiUrl);
      
      const emailResult = await sendEmail({
        to: email,
        subject: "Surrendered Sinner - Email Verification Reminder",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Verify Your Email</h1>
            <p>Hi there,</p>
            <p>You requested a new verification link for your Surrendered Sinner account. Please verify your email address by clicking the link below:</p>
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
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
              <p>Surrendered Sinner Elite Fitness Coaching</p>
              <p>&copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.</p>
            </div>
          </div>
        `,
      });
      
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            SURRENDERED<span className="text-red-600">SINNER</span>
          </h1>
          <p className="text-gray-400 mt-2">Elite fitness coaching</p>
        </div>
        
        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center justify-center">
              <Mail className="mr-2 h-6 w-6 text-primary" />
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Please check your inbox for the verification link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">
                    We sent a verification link to <span className="font-semibold text-white">{email}</span>. 
                    You need to verify your email before you can access your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              <p>Didn't receive the email? Check your spam folder or request a new verification link.</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleResendEmail} 
              className="w-full"
              disabled={resendCooldown > 0 || isSendingEmail}
            >
              {isSendingEmail ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending Email...
                </span>
              ) : resendCooldown > 0 ? (
                `Resend Email (${resendCooldown}s)`
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-700 text-gray-300"
              onClick={() => navigate("/auth")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
