
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
  
  // Parse token and email from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      mounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    const verifyEmail = async () => {
      // Check if token and email are present
      if (!token || !email) {
        setVerificationStatus('error');
        setStatusMessage('Missing verification parameters');
        setIsProcessing(false);
        console.error('Missing verification parameters', { token, email });
        return;
      }
      
      try {
        console.log('Verifying token for email:', email);
        
        // 1. Verify token from database
        const { data: tokenData, error: tokenError } = await supabase
          .from('verification_tokens')
          .select('*')
          .eq('token', token)
          .eq('user_email', email)
          .single();
        
        if (tokenError || !tokenData) {
          console.error('Error verifying token:', tokenError || 'Token not found');
          setVerificationStatus('error');
          setStatusMessage('Invalid or expired verification link');
          setIsProcessing(false);
          return;
        }
        
        // 2. Check token expiration
        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt < new Date()) {
          console.error('Token expired:', expiresAt);
          setVerificationStatus('error');
          setStatusMessage('Verification link has expired. Please request a new one.');
          setIsProcessing(false);
          return;
        }
        
        // 3. Update profile verification status
        let profileUpdated = false;
        
        // If user is already authenticated
        if (user) {
          profileUpdated = await updateEmailConfirmationStatus(user.id, email);
        } else {
          // Try to find user by email and update
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();
            
          if (profileData?.id) {
            profileUpdated = await updateEmailConfirmationStatus(profileData.id, email);
          }
        }
        
        console.log('Profile update result:', profileUpdated);
        
        // 4. Delete the used token
        await supabase
          .from('verification_tokens')
          .delete()
          .eq('token', token);
        
        // Set success state
        if (mounted.current) {
          setVerificationStatus('success');
          setStatusMessage('Email verification successful!');
          
          // Show success toast
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified.",
          });
          
          // If user is authenticated, refresh profile to update UI
          if (isAuthenticated && user) {
            await refreshProfile();
          }
          
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
  }, [token, email, user, navigate, toast, refreshProfile, isAuthenticated]);
  
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
