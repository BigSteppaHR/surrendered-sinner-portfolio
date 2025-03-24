
import { supabase } from "@/integrations/supabase/client";

export const createVerificationToken = async (email: string): Promise<string | null> => {
  try {
    // Generate a new verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    
    console.log("Generated new verification token for:", email);
    
    // Delete any existing tokens for this email
    const { error: deleteError } = await supabase
      .from('verification_tokens')
      .delete()
      .eq('user_email', email);
      
    if (deleteError) {
      console.error("Error deleting existing tokens:", deleteError);
      throw new Error("Failed to prepare for email verification");
    }
    
    // Store the new token in Supabase
    const { error: insertError } = await supabase
      .from('verification_tokens')
      .insert({ 
        user_email: email, 
        token: verificationToken, 
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      });
      
    if (insertError) {
      console.error("Error storing verification token:", insertError);
      throw new Error("Failed to create verification token");
    }

    return verificationToken;
  } catch (error) {
    console.error("Error creating verification token:", error);
    return null;
  }
};

export const generateVerificationUrl = (token: string, email: string): string => {
  const BASE_URL = window.location.origin;
  return `${BASE_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
};
