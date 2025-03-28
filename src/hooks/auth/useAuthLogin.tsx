import { useState } from 'react';
import { useAuth, Profile } from '@/hooks/useAuth';

interface AuthLoginResult {
  isLoading: boolean;
  errorMessage: string;
  login: (email: string, password: string) => Promise<void>;
}

export const useAuthLogin = (): AuthLoginResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login: authLogin } = useAuth();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await authLogin(email, password);
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, errorMessage, login };
};
