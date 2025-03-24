
import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/safe-dialog";
import { X } from "lucide-react";
import EmailVerificationCard from "@/components/email/EmailVerificationCard";

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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mounted = useRef(true);
  
  // Get email from props, location state or user object
  const email = initialEmail || location.state?.email || user?.email || "";
  
  const { isSendingEmail, resendCooldown, handleResendEmail } = useEmailVerification(email);

  // Handle back to login - redirects to login page when requested
  const handleBackToLogin = () => {
    if (mounted.current) {
      onClose();
      navigate("/login");
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (mounted.current) {
      onClose();
      // Redirect to login page if redirectToLogin is true
      if (redirectToLogin) {
        navigate("/login");
      }
    }
  };

  // Set up cleanup function to update mounted ref when component unmounts
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // If user has confirmed email, close dialog and redirect to dashboard
  useEffect(() => {
    if (profile?.email_confirmed && mounted.current) {
      onClose();
      navigate("/dashboard");
    }
  }, [profile, navigate, onClose]);

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open === false && handleDialogClose()}>
      <DialogContent 
        className="p-0 bg-transparent border-none shadow-none max-w-md mx-auto" 
        aria-describedby="email-verification-description"
      >
        <DialogTitle className="sr-only">Email Verification</DialogTitle>
        <DialogClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div id="email-verification-description" className="sr-only">
          Please verify your email address to continue using the application
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
