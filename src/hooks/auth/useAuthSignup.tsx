
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/useEmail';
import { User, Session } from '@supabase/supabase-js';
import { 
  checkExistingUser,
  createAuthUser,
  createUserProfile,
  signOutUser
} from '@/services/userAccountService';
import { completeVerificationProcess } from '@/services/userVerificationService';

// Define the signup result type
type SignupResult = {
  error: any | null;
  data: { 
    user?: User | null;
    session?: Session | null;
    emailSent?: boolean;
    showVerification?: boolean;
    redirectTo?: string;
    redirectState?: any;
  } | null;
};

export const useAuthSignup = () => {
  const { toast } = useToast();
  const { sendEmail } = useEmail();

  // Process successful signup
  const handleSuccessfulSignup = async (
    user: User | null, 
    fullName: string, 
    email: string
  ): Promise<SignupResult> => {
    // Create user profile if user exists
    if (user) {
      const profileResult = await createUserProfile(user.id, email, fullName);
      if (!profileResult.success) {
        console.error("Profile creation failed:", profileResult.error);
      }
    }
    
    // Complete verification process
    const verificationResult = await completeVerificationProcess(sendEmail, email, fullName);
    
    if (!verificationResult.success) {
      toast({
        title: "Warning",
        description: "Account created but could not generate verification link. Please contact support.",
        variant: "destructive",
      });
      return { 
        error: null, 
        data: { 
          user: user, 
          session: null, 
          emailSent: false,
          showVerification: true 
        } 
      };
    }
    
    // Always sign the user out after signup to require email verification
    await signOutUser();
    
    // Show appropriate toast based on email sending result
    if (!verificationResult.emailSent) {
      toast({
        title: "Warning",
        description: "Account created but verification email could not be sent. Please contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });
    }
    
    return { 
      error: null, 
      data: { 
        user: user, 
        session: null, // No active session until email verification
        emailSent: verificationResult.emailSent,
        showVerification: true
      } 
    };
  };

  // Handle signup errors
  const handleSignupError = (error: any): SignupResult => {
    console.error('Signup error:', error.message);
    
    toast({
      title: "Signup failed",
      description: error.message || "There was a problem creating your account",
      variant: "destructive",
    });
    
    return { error, data: null };
  };

  // Handle case when user already exists
  const handleExistingUserError = (): SignupResult => {
    toast({
      title: "Account already exists",
      description: "An account with this email already exists. Please login instead.",
      variant: "destructive",
    });
    
    return { error: { message: "Account already exists" }, data: null };
  };

  // Handle special error cases
  const handleSpecialErrorCases = (error: any): SignupResult | null => {
    if (error.message?.includes("Email signups are disabled")) {
      toast({
        title: "Email authentication disabled",
        description: "Email registration is currently disabled in this application. Please contact the administrator.",
        variant: "destructive",
      });
      
      return { error, data: null };
    }
    
    return null; // Not a special case, continue with normal error handling
  };

  // Main signup function
  const signup = async (email: string, password: string, fullName: string): Promise<SignupResult> => {
    try {
      console.log('Attempting to create account for:', email);

      // Check if user already exists
      const userExists = await checkExistingUser(email);
      if (userExists) {
        console.log('User already exists:', email);
        return handleExistingUserError();
      }

      // Sign up the user with Supabase Auth
      const { user, error } = await createAuthUser(email, password, fullName);
      
      if (error) {
        console.error('Signup error:', error.message);
        
        // Check for special error cases
        const specialCaseResult = handleSpecialErrorCases(error);
        if (specialCaseResult) {
          return specialCaseResult;
        }
        
        return handleSignupError(error);
      }
      
      // Handle successful signup process
      return await handleSuccessfulSignup(user, fullName, email);
    } catch (error: any) {
      return handleSignupError(error);
    }
  };

  return { signup };
};
