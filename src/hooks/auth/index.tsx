
import { useAuthLogin } from './useAuthLogin';
import { useAuthSignup } from './useAuthSignup';
import { useAuthPassword } from './useAuthPassword';
import { useAuthLogout } from './useAuthLogout';

export const useAuthOperations = () => {
  const { login, refreshProfile } = useAuthLogin();
  const { signup } = useAuthSignup();
  const { resetPassword, updatePassword } = useAuthPassword();
  const { logout } = useAuthLogout();

  return {
    login,
    signup,
    logout,
    refreshProfile,
    resetPassword,
    updatePassword,
  };
};

export * from './useAuthLogin';
export * from './useAuthSignup';
export * from './useAuthPassword';
export * from './useAuthLogout';
