
import React, { useState } from 'react';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black to-[#300] opacity-90"></div>
        <div className="absolute top-0 left-1/2 w-1/2 h-full bg-[#ea384c]/5 blur-3xl rounded-full transform -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-1/3 h-1/2 bg-[#ea384c]/10 blur-3xl rounded-full"></div>
      </div>
      {children}
    </div>
  );
};

interface AuthPageProps {
  mode?: 'login' | 'signup' | 'forgot-password' | 'reset-password';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>(mode);

  const handleBackToLogin = () => {
    setAuthMode('login');
  };

  const renderTitle = () => {
    switch (authMode) {
      case 'signup':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      case 'reset-password':
        return 'Create New Password';
      default:
        return 'Welcome Back';
    }
  };

  const renderForm = () => {
    switch (authMode) {
      case 'signup':
        return <SignupForm onLoginClick={() => setAuthMode('login')} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBackToLogin={handleBackToLogin} />;
      case 'reset-password':
        return <ResetPasswordForm onBackToLogin={handleBackToLogin} />;
      default:
        return <LoginForm onSignupClick={() => setAuthMode('signup')} onForgotPasswordClick={() => setAuthMode('forgot-password')} />;
    }
  };

  return (
    <AnimatedBackground>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-white hover:text-white hover:bg-black/20"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <Logo size="large" />
            <h1 className="mt-6 text-3xl font-bold text-white">{renderTitle()}</h1>
            <p className="mt-2 text-gray-400 text-center">
              {authMode === 'login' ? 'Sign in to access your account' : 
               authMode === 'signup' ? 'Join Surrendered Sinner Fitness today' : 
               'We\'ll help you recover your password'}
            </p>
          </div>

          <div className="bg-[#111] p-6 rounded-lg border border-[#222] shadow-xl">
            {renderForm()}
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default AuthPage;
