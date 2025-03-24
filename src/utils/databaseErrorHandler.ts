
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
  }
  
  toast({
    title: 'Database Error',
    description: message,
    variant: 'destructive'
  });
};

/**
 * Wraps a Supabase query with error handling
 * @param queryFn Function that performs the Supabase query
 * @param errorMessage Optional custom error message
 * @returns The result of the query
 */
export const withErrorHandling = async <T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorMessage?: string
): Promise<{ data: T | null; error: PostgrestError | null }> => {
  try {
    const result = await queryFn();
    if (result.error) {
      handleDatabaseError(result.error, errorMessage);
    }
    return result;
  } catch (err) {
    console.error('Unexpected error in database query:', err);
    toast({
      title: 'Connection Error',
      description: errorMessage || 'Failed to connect to the database. Please check your internet connection.',
      variant: 'destructive'
    });
    return { data: null, error: { message: 'Unexpected error', details: '', hint: '', code: 'UNKNOWN' } };
  }
};
