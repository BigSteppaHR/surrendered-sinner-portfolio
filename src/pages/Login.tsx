
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import EmailVerificationDialog from "@/components/email/EmailVerificationDialog";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const { login, isAuthenticated, profile, isLoading, isInitialized } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  // Setup cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated && profile?.email_confirmed) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, profile, navigate, isInitialized]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const result = await login(values.email, values.password);
      
      if (result.error) {
        // Special handling for unconfirmed emails
        if (result.error.code === "email_not_confirmed" && result.data?.showVerification) {
          setVerificationEmail(values.email);
          setShowEmailVerification(true);
        } else {
          setLoginError(result.error.message || "Login failed. Please try again.");
        }
      } 
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseVerification = () => {
    setShowEmailVerification(false);
  };

  // Display a simplified loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <LoginHeader />
        
        <LoginForm 
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          loginError={loginError}
        />
        
        <LoginFooter />
      </div>

      <EmailVerificationDialog 
        isOpen={showEmailVerification}
        onClose={handleCloseVerification}
        initialEmail={verificationEmail}
      />
    </div>
  );
}
