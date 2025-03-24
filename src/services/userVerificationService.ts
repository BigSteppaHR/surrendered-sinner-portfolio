
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
    
    // Generate verification URL
    const verificationUrl = generateVerificationUrl(verificationToken, email);
    console.log("Generated verification URL:", verificationUrl);
    
    // Store token in database
    const stored = await storeVerificationToken(verificationToken, email);
    if (!stored) {
      console.error("Failed to store verification token");
      return null;
    }
    
    return verificationUrl;
  } catch (error) {
    console.error("Error generating verification token:", error);
    return null;
  }
};

// Send verification email
export const sendVerificationEmail = async (
  sendEmail: (params: any) => Promise<any>,
  email: string, 
  fullName: string, 
  verificationUrl: string
): Promise<boolean> => {
  try {
    const emailContent = generateVerificationEmailTemplate({
      fullName,
      verificationUrl
    });
    
    const emailResult = await sendEmail({
      to: email,
      subject: "Welcome to Surrendered Sinner - Verify Your Email",
      html: emailContent,
    });
    
    if (!emailResult.success) {
      console.error('Email sending failed with response:', emailResult);
      return false;
    }
    
    console.log('Verification email sent successfully to:', email, emailResult);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Complete verification process
export const completeVerificationProcess = async (
  sendEmail: (params: any) => Promise<any>,
  email: string, 
  fullName: string
): Promise<VerificationResult> => {
  // Generate and store verification token
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
