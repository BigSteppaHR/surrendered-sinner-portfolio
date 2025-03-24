
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/safe-dialog";
import { X } from "lucide-react";
import EmailVerificationCard from "@/components/email/EmailVerificationCard";
import { supabase } from "@/integrations/supabase/client";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  redirectToLogin?: boolean;
}

const EmailVerificationDialog = ({
  isOpen,
  onClose,
  initialEmail = "",
  redirectToLogin = true
}: EmailVerificationDialogProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mounted = useRef(true);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [dialogDescription, setDialogDescription] = useState("");
  const descriptionId = "email-verification-description";

  const { isSendingEmail, resendCooldown, handleResendEmail } = useEmailVerification(email);

  // Update email whenever props or state changes
  useEffect(() => {
    if (!mounted.current) return;
    
    const emailToUse = initialEmail || location.state?.email || user?.email || "";
    if (emailToUse) {
      setEmail(emailToUse);
      // Update dialog description when email changes
      setDialogDescription(`Please verify your email address ${emailToUse ? `(${emailToUse})` : ""} to continue using your account`);
      
      // Check if email is already verified
      checkEmailVerification(emailToUse);
    }
  }, [initialEmail, location.state?.email, user?.email]);

  // Check if email is already verified in the database
  const checkEmailVerification = async (emailToCheck: string) => {
    if (!emailToCheck) return;
    
    setIsCheckingVerification(true);
    
    try {
      // First check if the current profile has email_confirmed=true
      if (profile?.email_confirmed) {
        console.log("Email already verified according to profile:", profile);
        setIsEmailVerified(true);
        setIsCheckingVerification(false);
        
        // Close dialog if email is verified
        if (isOpen && mounted.current) {
          setIsVisible(false);
          setTimeout(() => {
            if (mounted.current) {
              onClose();
            }
          }, 300);
        }
        return;
      }
      
      // If we don't have a profile or email_confirmed is false, explicitly check the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('email_confirmed')
        .eq('email', emailToCheck)
        .maybeSingle();
      
      console.log("Database verification check:", { data, error, emailToCheck });
      
      if (!error && data && data.email_confirmed) {
        console.log("Email already verified according to database check:", data);
        setIsEmailVerified(true);
        
        // Refresh profile to update the local state
        await refreshProfile();
        
        // Close dialog if email is verified
        if (isOpen && mounted.current) {
          setIsVisible(false);
          setTimeout(() => {
            if (mounted.current) {
              onClose();
            }
          }, 300);
        }
      } else {
        console.log("Email not verified in database:", error || "No verified profile found");
        setIsEmailVerified(false);
      }
    } catch (err) {
      console.error("Error checking email verification:", err);
    } finally {
      if (mounted.current) {
        setIsCheckingVerification(false);
      }
    }
  };

  // Handle visibility with a delay to prevent race conditions
  useEffect(() => {
    if (!mounted.current) return;
    if (!isOpen || isEmailVerified) {
      setIsVisible(false);
      return;
    }
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (mounted.current && !isEmailVerified) {
        setIsVisible(true);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, isEmailVerified]);

  // Handle back to login
  const handleBackToLogin = () => {
    if (!mounted.current) return;
    setIsVisible(false);
    
    // Small delay to ensure animation completes
    setTimeout(() => {
      if (mounted.current) {
        onClose();
        navigate("/login");
      }
    }, 300);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (!mounted.current) return;
    setIsVisible(false);
    
    // Small delay to ensure animation completes
    setTimeout(() => {
      if (mounted.current) {
        onClose();
        if (redirectToLogin) {
          navigate("/login");
        }
      }
    }, 300);
  };

  // Ensure proper cleanup
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // If user has confirmed email, close dialog and redirect to dashboard
  useEffect(() => {
    if (!profile?.email_confirmed || !mounted.current) return;
    
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      if (mounted.current) {
        onClose();
        navigate("/dashboard");
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [profile, navigate, onClose]);

  // Don't render anything if not open or if email is verified
  if (!isOpen || isEmailVerified) {
    return null;
  }

  // Show loading state while checking verification
  if (isCheckingVerification) {
    return (
      <Dialog open={isVisible}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md mx-auto">
          <div className="bg-gray-900 text-white p-6 rounded-lg flex justify-center items-center">
            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            <span>Checking verification status...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isVisible}
      onOpenChange={(open) => {
        if (!open && mounted.current) {
          handleDialogClose();
        }
      }}
    >
      <DialogContent
        className="p-0 bg-transparent border-none shadow-none max-w-md mx-auto"
        aria-describedby={descriptionId}
      >
        <DialogTitle className="sr-only">Email Verification</DialogTitle>
        <DialogClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Description for accessibility */}
        <div id={descriptionId} className="sr-only">
          {dialogDescription}
        </div>

        <EmailVerificationCard
          email={email}
          isLoading={false}
          isSendingEmail={isSendingEmail}
          resendCooldown={resendCooldown}
          onResendEmail={handleResendEmail}
          onBackToLogin={handleBackToLogin}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationDialog;
