
/**
 * Utility functions to handle Stripe API errors more gracefully
 */

import { useToast } from "@/hooks/use-toast";

/**
 * Handles errors that might occur during Stripe API interactions
 * @param error The error object from Stripe
 * @param customMessage Optional custom message to show instead of the default one
 */
export const handleStripeError = (error: any, customMessage?: string) => {
  const { toast } = useToast();
  
  // Log the error for debugging
  console.error("Stripe error:", error);
  
  // Default message
  let errorMessage = customMessage || "There was a problem processing your payment. Please try again later.";
  
  // Extract more specific error messages when available
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  // Show toast notification with error message
  toast({
    title: "Payment Error",
    description: errorMessage,
    variant: "destructive",
  });
  
  return errorMessage;
};

/**
 * Ensures the Stripe publishable key is properly formatted
 * @param key The Stripe publishable key
 * @returns The properly formatted key
 */
export const formatStripeKey = (key: string): string => {
  // Remove any whitespace
  let formattedKey = key.trim();
  
  // Check if the key starts with pk_ prefix (publishable key)
  if (!formattedKey.startsWith('pk_')) {
    console.warn('Warning: Stripe publishable key should start with "pk_"');
  }
  
  return formattedKey;
};

/**
 * Checks if the provided key appears to be a valid Stripe publishable key
 * @param key The key to validate
 * @returns Boolean indicating if the key is in the correct format
 */
export const isValidStripeKey = (key: string): boolean => {
  if (!key) return false;
  
  // Basic validation - publishable keys start with pk_ and are typically 90+ characters
  const isPublishableKey = key.trim().startsWith('pk_');
  const hasMinimumLength = key.trim().length >= 30;
  
  return isPublishableKey && hasMinimumLength;
};

/**
 * Initializes common stripe appearance options
 */
export const getDefaultStripeAppearance = () => {
  return {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#ea384c',
      colorBackground: '#18181b',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
    }
  };
};
