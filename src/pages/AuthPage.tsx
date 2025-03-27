
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginFooter from '@/components/auth/LoginFooter';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { Card } from '@/components/ui/card';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';

interface AuthPageProps {
  mode: 'login' | 'signup' | 'forgot-password' | 'reset-password';
}

const AuthPage = ({ mode }: AuthPageProps) => {
  const navigate = useNavigate();
  
  // Get title and meta description based on auth mode
  const getPageMeta = () => {
    switch (mode) {
      case 'login':
        return {
          title: 'Log In | Fitness Training',
          description: 'Log in to your Fitness Training account to access your workouts, track progress, and more.'
        };
      case 'signup':
        return {
          title: 'Sign Up | Fitness Training',
          description: 'Create a new account to get started with Fitness Training services and personalized workouts.'
        };
      case 'forgot-password':
        return {
          title: 'Reset Password | Fitness Training',
          description: 'Reset your Fitness Training account password.'
        };
      case 'reset-password':
        return {
          title: 'Set New Password | Fitness Training',
          description: 'Set a new password for your Fitness Training account.'
        };
      default:
        return {
          title: 'Account | Fitness Training',
          description: 'Manage your Fitness Training account.'
        };
    }
  };

  const meta = getPageMeta();

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>
      <SEO 
        title={meta.title}
        description={meta.description}
      />
      <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center">
        <AnimatedBackground />
        
        <Card className="w-full max-w-md mx-auto bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 shadow-xl">
          <LoginHeader mode={mode} />
          <LoginForm mode={mode} />
          <LoginFooter mode={mode} />
        </Card>
      </div>
    </>
  );
};

export default AuthPage;
