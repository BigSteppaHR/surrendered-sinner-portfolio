
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import * as z from "zod";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import EmailVerificationDialog from "@/components/email/EmailVerificationDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mountedRef = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check if an email is already verified in the database
  const checkEmailVerification = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    setIsCheckingVerification(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_confirmed')
        .eq('email', email)
        .maybeSingle();
      
      if (!error && data && data.email_confirmed) {
        console.log("Email already verified according to database check:", data);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error checking email verification:", err);
      return false;
    } finally {
      if (mountedRef.current) {
        setIsCheckingVerification(false);
      }
    }
  };

  // Debug logs
  useEffect(() => {
    console.log("Login page - Auth state:", { isAuthenticated, profile, isInitialized, isLoading });
  }, [isAuthenticated, profile, isInitialized, isLoading]);

  useEffect(() => {
    // Only redirect if the user is authenticated and email is confirmed
    if (isInitialized && isAuthenticated && profile?.email_confirmed) {
      console.log("Login: User authenticated and email confirmed, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, profile, navigate, isInitialized]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (!mountedRef.current) return;
    
    console.log("Login form submitted with:", values.email);
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      const result = await login(values.email, values.password);
      
      if (!mountedRef.current) return;
      
      console.log("Login result:", result);
      
      if (result.error) {
        console.log("Login error:", result.error);
        if (result.error.code === "email_not_confirmed" && result.data?.showVerification) {
          // Check if email is already verified in the database
          const isVerified = await checkEmailVerification(values.email);
          
          if (isVerified) {
            // If verified but auth state doesn't know it yet, refresh and try login again
            toast({
              title: "Email already verified",
              description: "Your email is already verified. Attempting to sign you in...",
            });
            
            // Try signing in again
            const retryResult = await login(values.email, values.password);
            
            if (retryResult.error) {
              setLoginError(retryResult.error.message || "Login failed. Please try again.");
              toast({
                title: "Login failed",
                description: retryResult.error.message || "Login failed. Please try again.",
                variant: "destructive",
              });
            }
          } else {
            // Email not verified, show verification dialog
            console.log("Email not confirmed, showing verification dialog for:", values.email);
            setVerificationEmail(values.email);
            setShowEmailVerification(true);
          }
        } else {
          const errorMessage = result.error.message || "Login failed. Please try again.";
          setLoginError(errorMessage);
          toast({
            title: "Login failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else if (result.data?.user) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
      // No need to navigate here as the useEffect will handle it
    } catch (error: any) {
      if (!mountedRef.current) return;
      
      console.error("Login error:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setLoginError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseVerification = () => {
    if (mountedRef.current) {
      setShowEmailVerification(false);
    }
  };

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
          isSubmitting={isSubmitting || isCheckingVerification}
          isLoading={isLoading}
          loginError={loginError}
        />
        
        <LoginFooter />
      </div>

      {showEmailVerification && (
        <EmailVerificationDialog 
          isOpen={showEmailVerification}
          onClose={handleCloseVerification}
          initialEmail={verificationEmail}
          redirectToLogin={false}
        />
      )}
    </div>
  );
}
