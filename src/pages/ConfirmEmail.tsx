
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, AlertTriangle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAuthenticated, isInitialized, user } = useAuth();
  const { toast } = useToast();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Get email from location state or user profile
  const email = location.state?.email || profile?.email || user?.email || "";
  
  const { isSendingEmail, resendCooldown, handleResendEmail } = useEmailVerification(email);

  useEffect(() => {
    // Don't run effects until auth is initialized
    if (!isInitialized) return;
    
    // Only set page as loaded after a brief delay to prevent flashing
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    
    // If user has confirmed email, redirect to dashboard
    if (isAuthenticated && profile?.email_confirmed) {
      toast({
        title: "Email verified",
        description: "Your email has been verified. Redirecting to dashboard...",
      });
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // If no email is available and auth is initialized, redirect to login
    if (isPageLoaded && !email && isInitialized) {
      toast({
        title: "Missing information",
        description: "Email information is missing. Please try logging in again.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
    }
    
    return () => clearTimeout(timer);
  }, [profile, isAuthenticated, navigate, email, isInitialized, isPageLoaded, toast]);
  
  const handleBackToLogin = () => {
    // Clear location state to prevent issues
    window.history.replaceState({}, document.title);
    navigate("/login", { replace: true });
  };

  // Show loading state until auth is initialized
  if (!isInitialized || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't render anything if about to redirect
  if (isAuthenticated && profile?.email_confirmed) {
    return null;
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
        
        <Card className="bg-gray-900 text-white border-gray-800 w-full shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center justify-center">
              <Mail className="mr-2 h-6 w-6 text-primary" />
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Please check your inbox for the verification link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">
                    We sent a verification link to <span className="font-semibold text-white">{email}</span>. 
                    You need to verify your email before you can access your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              <p>Didn't receive the email? Check your spam folder or request a new verification link.</p>
              <p className="mt-2 text-yellow-400">
                <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                Important: Verification emails may appear in your spam/junk folder.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleResendEmail} 
              className="w-full"
              disabled={resendCooldown > 0 || isSendingEmail}
            >
              {isSendingEmail ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending Email...
                </span>
              ) : resendCooldown > 0 ? (
                `Resend Email (${resendCooldown}s)`
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-700 text-gray-300"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
            
            <div className="text-center text-sm text-gray-400 pt-2">
              <Link 
                to="/"
                className="hover:text-gray-300 transition-colors"
                onClick={() => window.history.replaceState({}, document.title)}
              >
                Return to Home Page
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
