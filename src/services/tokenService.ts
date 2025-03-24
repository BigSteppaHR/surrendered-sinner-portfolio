
import { supabase } from "@/integrations/supabase/client";

export const createVerificationToken = async (email: string): Promise<string | null> => {
  try {
    // Generate a new verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    
    console.log("Generated new verification token for:", email);
    
    // Return the token but don't try to save it in the database - we'll handle verification elsewhere
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
