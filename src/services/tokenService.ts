
export const createVerificationToken = async (email: string): Promise<string | null> => {
  try {
    // Generate a simple and secure verification token (don't use for high-security purposes)
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    const verificationToken = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 20);
    
    console.log("Generated new verification token for:", email);
    
    // Return the token but don't try to save it in the database
    return verificationToken;
  } catch (error) {
    console.error("Error creating verification token:", error);
    return null;
  }
};

export const generateVerificationUrl = (token: string, email: string): string => {
  // Use the current origin for the verification URL
  const BASE_URL = window.location.origin;
  return `${BASE_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
};
