
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthLogin } from '@/hooks/auth/useAuthLogin';
import { Eye, EyeOff, Mail, Key, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AnimatedBackground from '@/components/auth/AnimatedBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quizResultId, setQuizResultId] = useState<string | null>(null);
  
  const { login } = useAuthLogin();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL params to get quiz result ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resultId = params.get('quizResultId');
    if (resultId) {
      setQuizResultId(resultId);
    }
    
    // Check for pending quiz data
    const storedQuizData = sessionStorage.getItem('pendingQuizData');
    if (storedQuizData && !resultId) {
      try {
        const { resultId: storedResultId } = JSON.parse(storedQuizData);
        if (storedResultId) {
          setQuizResultId(storedResultId);
        }
      } catch (error) {
        console.error("Error parsing stored quiz data:", error);
      }
    }
    
    // Extract redirect info from the location state
    const state = location.state as { redirectAfterLogin?: string } | undefined;
    if (state?.redirectAfterLogin) {
      console.log("Will redirect to:", state.redirectAfterLogin);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Please provide both email and password');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const result = await login(email, password);
      
      if (result.error) {
        console.error("Login error:", result.error);
        setErrorMessage(result.error.message || 'Invalid login credentials');
        setIsProcessing(false);
        return;
      }
      
      // If we have a quiz result ID, store it to be handled after login
      if (quizResultId) {
        const quizData = {
          resultId: quizResultId
        };
        sessionStorage.setItem('pendingQuizConnection', JSON.stringify(quizData));
      }
      
      // Redirect based on location state or default to dashboard
      const state = location.state as { redirectAfterLogin?: string } | undefined;
      const redirectPath = state?.redirectAfterLogin || result?.data?.redirectTo || '/dashboard';
      navigate(redirectPath);
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage(err.message || 'An error occurred during login');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const navigateToSignup = () => {
    const queryParams = quizResultId ? `?quizResultId=${quizResultId}` : '';
    navigate(`/signup${queryParams}`);
  };

  const navigateToResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Lock className="h-6 w-6 text-sinner-red" />
                <span>Welcome Back</span>
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter your credentials to access your account
                {quizResultId && (
                  <p className="mt-1 text-sm text-sinner-red">Your custom training plan will be connected to your account</p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-800 text-white">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
                      <button
                        type="button"
                        onClick={navigateToResetPassword}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-sinner-red hover:bg-red-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Separator className="bg-gray-800" />
              <div className="text-center w-full">
                <span className="text-gray-400">Don't have an account?</span>{" "}
                <button 
                  onClick={navigateToSignup}
                  className="text-primary hover:underline"
                  type="button"
                >
                  Sign up
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Login;
