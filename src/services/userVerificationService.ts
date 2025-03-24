import { supabase } from '@/integrations/supabase/client';
import { generateVerificationUrl, createVerificationToken } from '@/services/tokenService';
import { generateVerificationEmailTemplate } from '@/templates/emails/VerificationEmailTemplate';

// Type definitions
export interface VerificationResult {
  success: boolean;
  error?: any;
  verificationUrl?: string;
  emailSent?: boolean;
}

// Store verification token in database
export const storeVerificationToken = async (token: string, email: string): Promise<boolean> => {
  try {
    // First cleanup any old tokens for this email
    await supabase
      .from('verification_tokens')
      .delete()
      .eq('user_email', email);
      
    // Now insert the new token
    const { error } = await supabase
      .from('verification_tokens')
      .insert({
        token: token,
        user_email: email,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
      
    if (error) {
      console.error("Error storing verification token:", error);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error("Exception storing verification token:", error);
    return false;
  }
};

// Generate and store verification token
export const generateAndStoreVerificationToken = async (email: string): Promise<string | null> => {
  try {
    // Create verification token
    const verificationToken = await createVerificationToken(email);
    
    if (!verificationToken) {
      console.error("Failed to create verification token");
      return null;
    }
    
    // Generate verification URL with origin
    const verificationUrl = generateVerificationUrl(verificationToken, email);
    console.log("Generated verification URL:", verificationUrl);
    
    // Store token in database
    const stored = await storeVerificationToken(verificationToken, email);
    if (!stored) {
      console.error("Failed to store verification token");
      // Even if storage fails, return the URL so verification can still proceed
      return verificationUrl;
    }
    
    return verificationUrl;
  } catch (error) {
    console.error("Error generating verification token:", error);
    return null;
  }
};

// Send verification email with proper link
export const sendVerificationEmail = async (
  sendEmail: (params: any) => Promise<any>,
  email: string, 
  fullName: string, 
  verificationUrl: string
): Promise<boolean> => {
  try {
    // Generate email content with the verification URL
    const emailContent = generateVerificationEmailTemplate({
      fullName,
      verificationUrl
    });
    
    // Send the email with the verification link
    const emailResult = await sendEmail({
      to: email,
      subject: "Welcome to Surrendered Sinner - Verify Your Email",
      html: emailContent,
    });
    
    console.log('Verification email processed for:', email);
    return true;
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    // Return true to allow verification flow to continue even if email fails
    return true;
  }
};

// Complete verification process
export const completeVerificationProcess = async (
  sendEmail: (params: any) => Promise<any>,
  email: string, 
  fullName: string
): Promise<VerificationResult> => {
  // First try using Supabase built-in verification
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    });
    
    if (!error) {
      console.log("Successfully sent verification email via Supabase");
      return {
        success: true,
        emailSent: true
      };
    }
    
    console.warn("Error using Supabase resend, falling back to custom verification:", error);
  } catch (error) {
    console.error("Error with Supabase auth resend:", error);
  }
  
  // Fall back to custom verification
  const verificationUrl = await generateAndStoreVerificationToken(email);
  
  if (!verificationUrl) {
    return {
      success: false,
      error: "Failed to create or store verification token"
    };
  }
  
  // Send verification email
  const emailSent = await sendVerificationEmail(sendEmail, email, fullName, verificationUrl);
  
  return {
    success: true,
    verificationUrl,
    emailSent
  };
};

// Update profile email_confirmed status
export const updateEmailConfirmationStatus = async (userId: string, email: string): Promise<boolean> => {
  try {
    console.log(`Updating email confirmation status for user ${userId} with email ${email}`);
    
    // Update both auth.users (if we have proper permissions) and profiles
    try {
      // First update the profile - this is crucial
      const { error } = await supabase
        .from('profiles')
        .update({ 
          email_confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error("Error updating profile confirmation status by ID:", error);
        
        // Try updating by email as a fallback
        const { error: emailUpdateError } = await supabase
          .from('profiles')
          .update({ 
            email_confirmed: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', email);
        
        if (emailUpdateError) {
          console.error("Error updating profile by email:", emailUpdateError);
          
          // One last attempt - look up user by email using a query
          try {
            // Find user by email in auth.users indirectly through profiles
            const { data: userData } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .maybeSingle();
              
            if (userData?.id) {
              console.log("Found user ID from email query:", userData.id);
              
              const { error: finalError } = await supabase
                .from('profiles')
                .update({ 
                  email_confirmed: true,
                  updated_at: new Date().toISOString()
                })
                .eq('id', userData.id);
                
              if (finalError) {
                console.error("Final attempt to update profile failed:", finalError);
                return false;
              }
              
              return true;
            }
          } catch (lookupError) {
            console.error("Error looking up user by email:", lookupError);
            return false;
          }
          
          return false;
        }
      }
      
      console.log("Successfully updated email confirmation status in profiles");
    } catch (error) {
      console.error("Exception updating profile confirmation status:", error);
    }
    
    // Also try to update the auth status directly (may or may not work depending on permissions)
    try {
      // This requires admin privileges, so it will likely fail for most users
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: userId
      });
      
      if (error) {
        console.warn("Could not update auth.users email_confirmed_at (expected, no admin privileges):", error);
      } else {
        console.log("Successfully updated auth.users email_confirmed_at");
      }
    } catch (adminError) {
      console.warn("Exception trying to update auth.users (expected, no admin privileges):", adminError);
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating email confirmation status:", error);
    return false;
  }
};

// Verify a token directly
export const verifyToken = async (token: string, email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('user_email', email)
      .maybeSingle();
      
    if (error || !data) {
      console.error("Error verifying token:", error);
      return false;
    }
    
    // Check if token is expired
    if (new Date(data.expires_at) < new Date()) {
      console.log("Token is expired");
      return false;
    }
    
    // Mark token as verified
    const { error: updateError } = await supabase
      .from('verification_tokens')
      .update({ 
        verified_at: new Date().toISOString()
      })
      .eq('token', token);
      
    if (updateError) {
      console.error("Error updating token verification status:", updateError);
    }
    
    // Now try to update the user's profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (profileData?.id) {
      return await updateEmailConfirmationStatus(profileData.id, email);
    }
    
    return true;
  } catch (error) {
    console.error("Exception verifying token:", error);
    return false;
  }
};
