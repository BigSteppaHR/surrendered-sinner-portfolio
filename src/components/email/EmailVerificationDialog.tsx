
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

  // Handle back to login - closes the dialog and navigates if needed
  const handleBackToLogin = () => {
    onClose();
    navigate("/auth");
  };

  // If user has confirmed email, close dialog and redirect to dashboard
  React.useEffect(() => {
    if (profile?.email_confirmed) {
      onClose();
      navigate("/dashboard");
    }
  }, [profile, navigate, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md mx-auto">
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
