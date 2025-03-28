
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthLoginResult {
  isLoading: boolean;
  errorMessage: string;
  login: (email: string, password: string) => Promise<{ error: any | null, data: any | null }>;
}

export const useAuthLogin = (): AuthLoginResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login: authLogin } = useAuth();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await authLogin(email, password);
      return result;
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      return { error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, errorMessage, login };
};
