
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import EmailVerificationCard from "@/components/email/EmailVerificationCard";

const ConfirmEmail = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get email from location state or user object
  const email = location.state?.email || user?.email || "";
  
  const { isSendingEmail, resendCooldown, handleResendEmail } = useEmailVerification(email);

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
        
        <EmailVerificationCard 
          email={email}
          isLoading={isLoading}
          isSendingEmail={isSendingEmail}
          resendCooldown={resendCooldown}
          onResendEmail={handleResendEmail}
          onBackToLogin={() => navigate("/auth")}
        />
      </div>
    </div>
  );
};

export default ConfirmEmail;
