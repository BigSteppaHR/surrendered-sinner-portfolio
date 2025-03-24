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

  const { isSendingEmail, resendCooldown, handleResendEmail } = useEmailVerification(email);

  // Update email whenever props or state changes
  useEffect(() => {
    const emailToUse = initialEmail || location.state?.email || user?.email || "";
    if (emailToUse) {
      setEmail(emailToUse);
      // Update dialog description when email changes
      setDialogDescription(`Please verify your email address ${emailToUse ? `(${emailToUse})` : ""} to continue using your account`);
    }
  }, [initialEmail, location.state?.email, user?.email]);

  // Handle visibility safely with a small delay
  useEffect(() => {
    let visibilityTimer: NodeJS.Timeout;

    // Only update visibility if mounted
    if (mounted.current) {
      if (isOpen) {
        // Small delay before showing to ensure proper rendering
        visibilityTimer = setTimeout(() => {
          if (mounted.current) {
            setIsVisible(true);
          }
        }, 100); // Slightly increased delay
      } else {
        setIsVisible(false);
      }
    }

    return () => {
      if (visibilityTimer) clearTimeout(visibilityTimer);
    };
  }, [isOpen]);

  // Handle back to login - redirects to login page when requested
  const handleBackToLogin = () => {
    if (mounted.current) {
      onClose();
      navigate("/login");
    }
  };

  // Handle dialog close with improved timing
  const handleDialogClose = () => {
    if (mounted.current) {
      setIsVisible(false);

      // Small delay before actually closing to ensure animations complete
      const closeTimer = setTimeout(() => {
        if (mounted.current) {
          onClose();
          // Redirect to login page if redirectToLogin is true
          if (redirectToLogin) {
            navigate("/login");
          }
        }
      }, 150);

      return () => {
        clearTimeout(closeTimer);
      };
    }
  };

  // Set up cleanup function to update mounted ref when component unmounts
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // If user has confirmed email, close dialog and redirect to dashboard
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    if (profile?.email_confirmed && mounted.current) {
      setIsVisible(false);

      // Small delay before redirecting
      redirectTimer = setTimeout(() => {
        if (mounted.current) {
          onClose();
          navigate("/dashboard");
        }
      }, 150);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
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
        aria-describedby="email-verification-description"
      >
        <DialogTitle className="sr-only">Email Verification</DialogTitle>
        <DialogClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring[...]">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Hidden description for accessibility */}
        <div
          id="email-verification-description"
          className="sr-only"
        >
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
