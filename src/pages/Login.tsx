
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import * as z from "zod";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import EmailVerificationDialog from "@/components/email/EmailVerificationDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedBackground from "@/components/auth/AnimatedBackground";

// Lazy load components to improve initial loading performance
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

  // Component cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Debug logs
  useEffect(() => {
    console.log("Login page - Auth state:", { 
      isAuthenticated, 
      profile, 
      isInitialized, 
      isLoading,
      redirectAttempted: redirectAttemptedRef.current
    });
  }, [isAuthenticated, profile, isInitialized, isLoading]);

  // Memoized email verification check function to improve performance
  const checkEmailVerification = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    setIsCheckingVerification(true);
    
    try {
      // Check if the profile exists - use cached result if available
      const { data, error } = await supabase
        .from('profiles')
        .select('email_confirmed')
        .eq('email', email)
        .maybeSingle()
        .abortSignal(AbortSignal.timeout(3000)); // Add timeout to prevent long-running queries
      
      console.log("Profile verification check result:", { data, error });
      
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

  // Check for verification success message
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Success",
        description: location.state.message,
      });
      
      // Clear the state message to prevent showing it again on page refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, toast]);

  // Auto-redirect to dashboard if authenticated
  useEffect(() => {
    // Only redirect if the user is authenticated and initialization is complete
    if (isInitialized && isAuthenticated && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      console.log("Login: User authenticated, checking profile for redirect:", profile);
      
      if (profile?.email_confirmed) {
        console.log("Login: User authenticated and email confirmed, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else if (profile && !showEmailVerification) {
        // If authenticated but email not confirmed, show verification dialog
        console.log("Login: User authenticated but email not confirmed, showing verification dialog");
        setVerificationEmail(profile.email || "");
        setShowEmailVerification(true);
      }
    }
  }, [isAuthenticated, profile, navigate, isInitialized, showEmailVerification]);

  // Optimized form submission handler
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
        // Reset the redirect attempted flag to ensure we try to redirect again
        redirectAttemptedRef.current = false;
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Try an explicit redirect here if the user is confirmed
        if (result.data.profile?.email_confirmed) {
          navigate("/dashboard", { replace: true });
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
