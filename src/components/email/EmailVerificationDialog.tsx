
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
    let visibilityTimer: NodeJS.Timeout | undefined;

    if (mounted.current) {
      if (isOpen) {
        // Increased delay for dialog opening to ensure DOM is ready
        visibilityTimer = setTimeout(() => {
          if (mounted.current) {
            setIsVisible(true);
          }
        }, 500);
      } else {
        setIsVisible(false);
      }
    }

    return () => {
      if (visibilityTimer) clearTimeout(visibilityTimer);
    };
  }, [isOpen]);

  // Handle back to login with proper unmounting
  const handleBackToLogin = () => {
    if (!mounted.current) return;
    
    // First hide the dialog
    setIsVisible(false);
    
    // Longer delay to ensure all animations complete before navigation
    setTimeout(() => {
      if (mounted.current) {
        onClose();
        navigate("/login");
      }
    }, 500);
  };

  // Handle dialog close with improved timing
  const handleDialogClose = () => {
    if (!mounted.current) return;
    
    // First hide the dialog
    setIsVisible(false);

    // Increased delay before actually closing
    const closeTimer = setTimeout(() => {
      if (mounted.current) {
        onClose();
        // Redirect to login page if redirectToLogin is true
        if (redirectToLogin) {
          navigate("/login");
        }
      }
    }, 500);

    return () => {
      clearTimeout(closeTimer);
    };
  };

  // Ensure proper cleanup to prevent memory leaks
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // If user has confirmed email, close dialog and redirect to dashboard
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout | undefined;

    if (profile?.email_confirmed && mounted.current) {
      setIsVisible(false);

      // Increased delay before redirecting
      redirectTimer = setTimeout(() => {
        if (mounted.current) {
          onClose();
          navigate("/dashboard");
        }
      }, 500);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [profile, navigate, onClose]);

  // Don't render anything if not open to prevent DOM issues
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

        {/* Description for accessibility - properly linked with aria-describedby */}
        <div
          id={descriptionId}
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
