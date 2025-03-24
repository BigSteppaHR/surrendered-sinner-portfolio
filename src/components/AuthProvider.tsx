
import React, { ReactNode, createContext, useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/auth';
import { AuthContextType } from '@/hooks/useAuth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get auth state and operations from custom hooks
  const authState = useAuthState();
  const authOperations = useAuthOperations();

  // Combine state and operations
  // Use the refreshProfile from authState which has the correct signature
  const value: AuthContextType = {
    ...authState,
    ...authOperations,
    // Override with the refreshProfile from authState
    refreshProfile: authState.refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
