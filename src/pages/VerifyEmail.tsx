
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set up cleanup
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          console.error("Missing verification parameters", { token, email });
          setVerificationStatus('error');
          setErrorMessage("Missing verification parameters");
          return;
        }

        console.log("Verifying email with token:", token, "and email:", email);

        // Check if token exists and is valid
        const { data: tokenData, error: tokenError } = await supabase
          .from('verification_tokens')
          .select('*')
          .eq('token', token)
          .eq('user_email', email)
          .maybeSingle();

        if (tokenError || !tokenData) {
          console.error("Token verification failed:", tokenError);
          setVerificationStatus('error');
          setErrorMessage("Invalid or expired verification token");
          return;
        }

        // Check if token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
          console.error("Token expired:", tokenData.expires_at);
          setVerificationStatus('error');
          setErrorMessage("Verification token has expired");
          return;
        }

        console.log("Token is valid, updating profile");

        // Get user profile by email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (profileError || !profile) {
          console.error("Profile not found:", profileError || "No profile exists");
          setVerificationStatus('error');
          setErrorMessage("User profile not found. Please contact support.");
          return;
        }

        // Update the user's profile to mark email as confirmed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email_confirmed: true })
          .eq('id', profile.id);

        if (updateError) {
          console.error("Profile update failed:", updateError);
          setVerificationStatus('error');
          setErrorMessage("Failed to verify email. Please try again.");
          return;
        }

        console.log("Profile updated successfully, deleting token");

        // Delete the token after successful verification
        await supabase
          .from('verification_tokens')
          .delete()
          .eq('token', token);

        if (mountedRef.current) {
          console.log("Email verification completed successfully");
          setVerificationStatus('success');
          
          toast({
            title: "Email verified",
            description: "Your email has been successfully verified. You can now log in to access your account.",
          });
          
          // Automatically redirect to login after successful verification
          setTimeout(() => {
            if (mountedRef.current) {
              navigate('/login');
            }
          }, 3000); // 3 second delay to show success message before redirecting
        }
        
      } catch (error) {
        console.error("Email verification error:", error);
        if (mountedRef.current) {
          setVerificationStatus('error');
          setErrorMessage("An unexpected error occurred during verification");
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate, refreshProfile, toast]);

  // Handler to go to login page
  const handleRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            SURRENDERED<span className="text-red-600">SINNER</span>
          </h1>
          <p className="text-gray-400 mt-2">Elite fitness coaching</p>
        </div>

        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              {verificationStatus === 'loading' && (
                <>
                  <Loader2 className="animate-spin h-6 w-6 text-primary mr-2" />
                  Verifying Your Email
                </>
              )}
              {verificationStatus === 'success' && (
                <>
                  <CheckCircle className="text-green-500 mr-2 h-6 w-6" />
                  Email Verified
                </>
              )}
              {verificationStatus === 'error' && (
                <>
                  <XCircle className="text-red-500 mr-2 h-6 w-6" />
                  Verification Failed
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            {verificationStatus === 'loading' && (
              <p className="text-gray-300">
                Please wait while we verify your email address...
              </p>
            )}
            {verificationStatus === 'success' && (
              <p className="text-gray-300">
                Your email has been successfully verified. Redirecting you to login...
              </p>
            )}
            {verificationStatus === 'error' && (
              <p className="text-gray-300">
                {errorMessage || "We couldn't verify your email. The link may be invalid or expired."}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            {(verificationStatus === 'error' || verificationStatus === 'success') && (
              <Button onClick={handleRedirect} className="w-full">
                Go to Login
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default VerifyEmail;
