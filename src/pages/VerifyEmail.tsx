
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setIsVerifying(true);
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        if (!token || !email) {
          throw new Error("Verification token or email is missing");
        }

        // Get the token from the verification_tokens table
        const { data: tokenData, error: tokenError } = await supabase
          .from('verification_tokens')
          .select('*')
          .eq('token', token)
          .eq('user_email', email)
          .single();

        if (tokenError || !tokenData) {
          throw new Error("Invalid or expired verification token");
        }

        // Check if token has expired
        if (new Date(tokenData.expires_at) < new Date()) {
          throw new Error("Verification token has expired");
        }

        // Update the user's profile to mark email as confirmed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email_confirmed: true, email: email })
          .eq('email', email);

        if (updateError) {
          throw new Error("Failed to verify email");
        }

        // Delete the used token
        await supabase
          .from('verification_tokens')
          .delete()
          .eq('token', token);

        setIsSuccess(true);
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. You can now log in.",
          variant: "default",
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } catch (error: any) {
        console.error("Verification error:", error);
        setError(error.message);
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-gray-900 text-white border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription className="text-gray-400">
            Verifying your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
          {isVerifying ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p>Processing your verification...</p>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-xl font-bold">Email Verified!</p>
              <p>Your email has been successfully verified. You will be redirected to the login page shortly.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 text-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p className="text-xl font-bold">Verification Failed</p>
              <p>{error || "An unknown error occurred during verification."}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate("/auth")} 
            variant={isSuccess ? "default" : "outline"}
            disabled={isVerifying}
          >
            {isSuccess ? "Continue to Login" : "Back to Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
