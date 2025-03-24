
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import EmailVerificationCard from "@/components/email/EmailVerificationCard";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

const EmailVerificationDialog = ({ isOpen, onClose, initialEmail = "" }: EmailVerificationDialogProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from props, location state or user object
  const email = initialEmail || location.state?.email || user?.email || "";
  
  const { isSendingEmail, resendCooldown, handleResendEmail } = useEmailVerification(email);

  // Handle back to login - just closes the dialog when on auth page
  const handleBackToLogin = () => {
    onClose();
  };

  // If user has confirmed email, close dialog and redirect to dashboard
  React.useEffect(() => {
    if (profile?.email_confirmed) {
      onClose();
      // Only navigate if not already on /auth
      if (location.pathname !== "/auth") {
        navigate("/dashboard");
      }
    }
  }, [profile, navigate, onClose, location.pathname]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md mx-auto">
        <DialogTitle className="sr-only">Email Verification</DialogTitle>
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
