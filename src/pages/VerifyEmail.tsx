
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
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
          .single();

        if (tokenError || !tokenData) {
          console.error("Token verification failed:", tokenError);
          setVerificationStatus('error');
          setErrorMessage("Invalid or expired verification token");
          return;
        }

        // Check if token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
          setVerificationStatus('error');
          setErrorMessage("Verification token has expired");
          return;
        }

        // Update the user's profile to mark email as confirmed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email_confirmed: true })
          .eq('email', email);

        if (updateError) {
          console.error("Profile update failed:", updateError);
          setVerificationStatus('error');
          setErrorMessage("Failed to verify email. Please try again.");
          return;
        }

        // Delete the token after successful verification
        await supabase
          .from('verification_tokens')
          .delete()
          .eq('token', token);

        // Update the auth context by refreshing the profile
        await refreshProfile();

        setVerificationStatus('success');
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationStatus('error');
        setErrorMessage("An unexpected error occurred during verification");
      }
    };

    verifyEmail();
  }, [searchParams, navigate, refreshProfile]);

  const handleRedirect = () => {
    if (verificationStatus === 'success') {
      navigate('/dashboard');
    } else {
      navigate('/confirm-email');
    }
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
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
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
                Your email has been successfully verified. You can now access all features of your account.
              </p>
            )}
            {verificationStatus === 'error' && (
              <p className="text-gray-300">
                {errorMessage || "We couldn't verify your email. The link may be invalid or expired."}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            {verificationStatus !== 'loading' && (
              <Button onClick={handleRedirect} className="w-full">
                {verificationStatus === 'success' ? 'Go to Dashboard' : 'Try Again'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
