
import React, { useEffect, useRef, useState } from "react";
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
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
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
    }
  }, [initialEmail, location.state?.email, user?.email]);

  // Handle visibility with a delay to prevent race conditions
  useEffect(() => {
    if (!mounted.current) return;
    if (!isOpen) {
      setIsVisible(false);
      return;
    }
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (mounted.current) {
        setIsVisible(true);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

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

  // Don't render anything if not open
  if (!isOpen) {
    return null;
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
