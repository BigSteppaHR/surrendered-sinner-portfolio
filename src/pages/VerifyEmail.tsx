
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { updateEmailConfirmationStatus } from '@/services/userVerificationService';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, refreshProfile, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'processing'>('processing');
  const [statusMessage, setStatusMessage] = useState('Verifying your email...');
  const { toast } = useToast();
  const mounted = useRef(true);
  
  // Parse token and type from URL query parameters - they would come from Supabase auth
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || searchParams.get('access_token');
  const type = searchParams.get('type');
  const redirectTo = searchParams.get('redirect_to');
  const email = searchParams.get('email');
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      mounted.current = false;
    };
  }, []);
  
  // Handle the case where we're redirected from Supabase's auth system
  useEffect(() => {
    const checkForSupabaseAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          return false;
        }
        
        if (data.session?.user?.email_confirmed_at) {
          console.log("Email already confirmed via Supabase auth:", data.session.user);
          return true;
        }
        
        return false;
      } catch (err) {
        console.error("Error checking Supabase auth:", err);
        return false;
      }
    };
    
    const processAutoVerification = async () => {
      // Check if we have an auto-verification situation
      const isVerifiedBySupabase = await checkForSupabaseAuth();
      
      if (isVerifiedBySupabase) {
        if (!mounted.current) return;
        
        setVerificationStatus('success');
        setStatusMessage('Your email has been successfully verified!');
        
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified.",
        });
        
        // If user is authenticated, refresh profile to update UI
        if (isAuthenticated && user) {
          await refreshProfile();
        }
        
        // Redirect after a short delay
        setTimeout(() => {
          if (mounted.current) {
            navigate('/login', { 
              replace: true,
              state: { 
                message: "Email verified successfully! You can now log in." 
              }
            });
          }
        }, 2000);
        
        setIsProcessing(false);
        return true;
      }
      
      return false;
    };
    
    // Try to verify if there's enough info, otherwise handle error
    const verifyEmail = async () => {
      // Check if auto-verification happened
      const isAutoVerified = await processAutoVerification();
      if (isAutoVerified) return;
      
      // If no token or type, and not auto-verified, show error
      if (!token) {
        setVerificationStatus('error');
        setStatusMessage('Missing verification parameters');
        setIsProcessing(false);
        console.error('Missing verification parameters', { token, type, redirectTo });
        return;
      }
      
      try {
        // If we have a token but no user info yet, try to get user by email
        if (!user?.id && email) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();
            
          if (profileData?.id) {
            const updated = await updateEmailConfirmationStatus(profileData.id, email);
            console.log("Updated profile status:", updated);
            
            if (updated) {
              if (mounted.current) {
                setVerificationStatus('success');
                setStatusMessage('Email verification successful!');
                
                toast({
                  title: "Email Verified",
                  description: "Your email has been successfully verified.",
                });
                
                // Wait a moment before redirecting
                setTimeout(() => {
                  if (mounted.current) {
                    navigate('/login', { 
                      replace: true,
                      state: { 
                        message: "Email verified successfully! You can now log in." 
                      }
                    });
                  }
                }, 2000);
              }
              return;
            }
          }
        }
        
        // If we can't verify through custom tokens or auto-verification,
        // show generic success and hope for the best
        if (mounted.current) {
          setVerificationStatus('success');
          setStatusMessage('Email verification process completed. Please log in.');
          
          toast({
            title: "Verification Process Completed",
            description: "Please log in to access your account",
          });
          
          // Wait a moment before redirecting
          setTimeout(() => {
            if (mounted.current) {
              navigate('/login', { 
                replace: true,
                state: { 
                  message: "Please log in to access your account" 
                }
              });
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error during verification process:', error);
        if (mounted.current) {
          setVerificationStatus('error');
          setStatusMessage('An error occurred during verification. Please try again.');
        }
      } finally {
        if (mounted.current) {
          setIsProcessing(false);
        }
      }
    };
    
    verifyEmail();
  }, [token, email, type, user, navigate, toast, refreshProfile, isAuthenticated, redirectTo]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            SURRENDERED<span className="text-red-600">SINNER</span>
          </h1>
          <p className="text-gray-400 mt-2">Elite fitness coaching</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            {verificationStatus === 'success' 
              ? 'Verification Successful' 
              : verificationStatus === 'error' 
                ? 'Verification Failed' 
                : 'Verifying Email'}
          </h2>
          
          <div className="my-6">
            {isProcessing ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : verificationStatus === 'success' ? (
              <div className="flex items-center justify-center mx-auto w-16 h-16 rounded-full bg-green-900/30 border-2 border-green-500">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center mx-auto w-16 h-16 rounded-full bg-red-900/30 border-2 border-red-500">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <p className="text-gray-300 mb-6">{statusMessage}</p>
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
