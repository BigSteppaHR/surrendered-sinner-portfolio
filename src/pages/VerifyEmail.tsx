
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

        // Check if user exists in profiles table
        const { data: profileData, error: profileFetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (profileFetchError) {
          console.error("Error fetching profile:", profileFetchError);
          setVerificationStatus('error');
          setErrorMessage("Failed to verify user profile. Please contact support.");
          return;
        }

        // If profile doesn't exist, we need to create it
        if (!profileData) {
          console.log("Profile not found, checking user in auth system");
          
          // First check if the user exists in auth system
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            console.error("User not found in auth system");
            setVerificationStatus('error');
            setErrorMessage("User account not found. Please try signing up again.");
            return;
          }
          
          // Create the profile with the user ID
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: user.id, 
                email: email,
                email_confirmed: true 
              }
            ]);
          
          if (createProfileError) {
            console.error("Failed to create profile:", createProfileError);
            setVerificationStatus('error');
            setErrorMessage("Failed to create user profile. Please contact support.");
            return;
          }
          
          console.log("Profile created successfully with email_confirmed=true");
        } else {
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
          
          console.log("Profile updated successfully with email_confirmed=true");
        }

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
            description: "Your email has been successfully verified. Signing you in automatically...",
          });
          
          // Get the user's password from local storage if available
          const storedCreds = localStorage.getItem(`temp_creds_${email}`);
          let password = null;
          
          if (storedCreds) {
            try {
              const parsedCreds = JSON.parse(storedCreds);
              password = parsedCreds.password;
              // Remove stored credentials after use
              localStorage.removeItem(`temp_creds_${email}`);
            } catch (e) {
              console.error("Error parsing stored credentials:", e);
            }
          }
          
          // Try to sign in automatically if we have stored credentials
          if (password) {
            try {
              console.log("Attempting automatic sign in for verified user");
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              
              if (signInError) {
                console.error("Auto sign-in failed:", signInError);
                // Still redirect to login since verification was successful
                setTimeout(() => {
                  if (mountedRef.current) {
                    navigate('/login', { 
                      state: { 
                        message: "Email verified successfully. Please sign in with your credentials." 
                      } 
                    });
                  }
                }, 2000);
              } else {
                console.log("Auto sign-in successful, redirecting to dashboard");
                // Refresh the profile to get the updated email_confirmed status
                await refreshProfile();
                
                // Redirect to dashboard after successful sign-in
                setTimeout(() => {
                  if (mountedRef.current) {
                    navigate('/dashboard', { 
                      state: { fromVerification: true },
                      replace: true 
                    });
                  }
                }, 1500);
              }
            } catch (signInError) {
              console.error("Exception during auto sign-in:", signInError);
              // Redirect to login with message
              setTimeout(() => {
                if (mountedRef.current) {
                  navigate('/login', { 
                    state: { 
                      message: "Email verified successfully. Please sign in with your credentials." 
                    } 
                  });
                }
              }, 2000);
            }
          } else {
            // No stored credentials, redirect to login
            console.log("No stored credentials, redirecting to login");
            setTimeout(() => {
              if (mountedRef.current) {
                navigate('/login', { 
                  state: { 
                    message: "Email verified successfully. Please sign in with your credentials." 
                  } 
                });
              }
            }, 2000);
          }
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
                Your email has been successfully verified. Signing you in automatically...
              </p>
            )}
            {verificationStatus === 'error' && (
              <p className="text-gray-300">
                {errorMessage || "We couldn't verify your email. The link may be invalid or expired."}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            {verificationStatus === 'error' && (
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
