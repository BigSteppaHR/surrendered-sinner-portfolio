
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import * as z from "zod";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedBackground from "@/components/auth/AnimatedBackground";

const EmailVerificationDialogLazy = lazy(() => import("@/components/email/EmailVerificationDialog"));

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
  const redirectAttemptedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("Login page - Auth state:", { 
      isAuthenticated, 
      profile, 
      isInitialized, 
      isLoading,
      redirectAttempted: redirectAttemptedRef.current
    });
    
    // Handle redirection when authentication changes
    if (isInitialized && isAuthenticated && profile && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      console.log("Login: User authenticated, redirecting based on profile:", profile);
      
      // If the user's email is confirmed, redirect them to the appropriate dashboard
      if (profile.email_confirmed) {
        if (profile.is_admin) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else if (!showEmailVerification) {
        // If email not confirmed, show verification dialog
        setVerificationEmail(profile.email || "");
        setShowEmailVerification(true);
      }
    }
  }, [isAuthenticated, profile, navigate, isInitialized, showEmailVerification]);

  const checkEmailVerification = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    setIsCheckingVerification(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_confirmed')
        .eq('email', email)
        .maybeSingle();
      
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          setIsCheckingVerification(false);
        }
      }, 3000);
      
      console.log("Profile verification check result:", { data, error });
      
      clearTimeout(timeoutId);
      
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

  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Success",
        description: location.state.message,
      });
      
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, toast]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (!mountedRef.current) return;
    
    console.log("Login form submitted with:", values.email);
    setIsSubmitting(true);
    setLoginError(null);
    redirectAttemptedRef.current = false; // Reset redirect flag to ensure we try again
    
    try {
      const result = await login(values.email, values.password);
      
      if (!mountedRef.current) return;
      
      console.log("Login result:", result);
      
      if (result.error) {
        if (result.error.code === "email_not_confirmed" && result.data?.showVerification) {
          const isVerified = await checkEmailVerification(values.email);
          
          if (isVerified) {
            toast({
              title: "Email already verified",
              description: "Your email is already verified. Attempting to sign you in...",
            });
            
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
        // Set redirect flag to false to allow the useEffect to redirect
        redirectAttemptedRef.current = false;
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Immediately redirect if we have profile info
        if (result.data.profile?.email_confirmed) {
          if (result.data.profile?.is_admin) {
            navigate("/admin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }
      }
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
  
  const handleForgotPassword = () => {
    navigate("/reset-password");
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginHeader />
          
          <LoginForm 
            onSubmit={onSubmit}
            isSubmitting={isSubmitting || isCheckingVerification}
            isLoading={isLoading}
            loginError={loginError}
            onForgotPassword={handleForgotPassword}
          />
          
          <LoginFooter />
        </div>

        {showEmailVerification && (
          <Suspense fallback={<div className="animate-pulse">Loading verification...</div>}>
            <EmailVerificationDialogLazy 
              isOpen={showEmailVerification}
              onClose={handleCloseVerification}
              initialEmail={verificationEmail}
              redirectToLogin={false}
            />
          </Suspense>
        )}
      </div>
    </AnimatedBackground>
  );
}
