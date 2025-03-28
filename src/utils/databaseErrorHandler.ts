
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

/**
 * Handles common database errors and provides user-friendly messages
 * @param error The error returned from Supabase query
 * @param customMessage Optional custom message to show instead of the default
 * @returns void
 */
export const handleDatabaseError = (
  error: PostgrestError | null, 
  customMessage?: string
): void => {
  if (!error) return;
  
  console.error('Database error:', error);
  
  // Map common error codes to user-friendly messages
  let message = customMessage || 'There was an error connecting to the database';
  
  if (error.code === '406') {
    // Not Acceptable - usually a client-side issue with headers
    message = 'The request could not be completed as expected. This is likely a temporary issue.';
    console.log('Received 406 error - likely due to Accept header mismatch');
  } else if (error.code === '23505') {
    // Unique violation
    message = 'This record already exists in our system.';
  } else if (error.code === '42P01') {
    // Undefined table
    message = 'System configuration error: Required data table not found.';
  } else if (error.code === '42501') {
    // Insufficient privilege
    message = 'You do not have permission to perform this action.';
  } else if (error.code === '28P01') {
    // Invalid password
    message = 'Authentication failed. Please check your credentials.';
  } else if (error.code === '23503') {
    // Foreign key violation
    message = 'This action cannot be completed because it references data that doesn\'t exist.';
  } else if (error.code === '57014') {
    // Query canceled
    message = 'The database request took too long and was canceled. Please try again.';
  } else if (error.code === '08006') {
    // Connection failure
    message = 'Lost connection to database. Please check your internet connection and try again.';
  }
  
  toast({
    title: 'Database Error',
    description: message,
    variant: 'destructive'
  });
};

/**
 * Wraps a Supabase query with error handling and automatic retries for connection issues
 * @param queryFn Function that performs the Supabase query
 * @param errorMessage Optional custom error message
 * @param retries Number of retry attempts for connection issues
 * @returns The result of the query
 */
export const withErrorHandling = async <T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorMessage?: string,
  retries: number = 2
): Promise<{ data: T | null; error: PostgrestError | null }> => {
  let attemptsRemaining = retries + 1; // Initial attempt + retries
  
  while (attemptsRemaining > 0) {
    attemptsRemaining--;
    
    try {
      // Ensure queryFn returns a Promise
      const result = await queryFn();
      
      // If connection error and we have attempts remaining, try again
      if (result.error && 
         (result.error.code === '08006' || result.error.code === '57014') && 
         attemptsRemaining > 0) {
        console.log(`Database connection error, retrying... (${attemptsRemaining} attempts left)`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries - attemptsRemaining)));
        continue;
      }
      
      // For other errors or if we're out of retries, handle the error
      if (result.error) {
        handleDatabaseError(result.error, errorMessage);
      }
      
      return result;
    } catch (err) {
      console.error('Unexpected error in database query:', err);
      
      // If this is not the last attempt, try again
      if (attemptsRemaining > 0) {
        console.log(`Unexpected error, retrying... (${attemptsRemaining} attempts left)`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries - attemptsRemaining)));
        continue;
      }
      
      toast({
        title: 'Connection Error',
        description: errorMessage || 'Failed to connect to the database. Please check your internet connection.',
        variant: 'destructive'
      });
      
      return { 
        data: null, 
        error: { 
          message: 'Unexpected error', 
          details: '', 
          hint: '', 
          code: 'UNKNOWN',
          name: 'UnexpectedError' 
        } 
      };
    }
  }
  
  // This should never be reached, but TypeScript needs it
  return { 
    data: null, 
    error: { 
      message: 'Maximum retry attempts exceeded', 
      details: '', 
      hint: '', 
      code: 'MAX_RETRIES',
      name: 'RetryError'
    } 
  };
};

/**
 * Helper to determine if a database error is due to a not found condition
 * @param error The PostgrestError object
 * @returns boolean indicating if the error is a not found error
 */
export const isNotFoundError = (error: PostgrestError | null): boolean => {
  if (!error) return false;
  return error.code === 'PGRST116' || // Row not found
         (error.message && error.message.includes('not found'));
};

/**
 * Helper to determine if a database error is due to a permission issue
 * @param error The PostgrestError object
 * @returns boolean indicating if the error is a permission error
 */
export const isPermissionError = (error: PostgrestError | null): boolean => {
  if (!error) return false;
  return error.code === '42501' || // Insufficient privilege
         error.code === 'PGRST204' || // Permission denied
         (error.message && (
           error.message.includes('permission denied') ||
           error.message.includes('violates row-level security')
         ));
};
