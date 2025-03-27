
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthSignup } from '@/hooks/auth/useAuthSignup';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, User, Mail, Key, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/auth/AnimatedBackground';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quizResultId, setQuizResultId] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { signup } = useAuthSignup();
  const { toast } = useToast();

  // Parse URL params to get quiz result ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resultId = params.get('quizResultId');
    if (resultId) {
      setQuizResultId(resultId);
      // Could pre-fill email if we had it
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
  }, [location]);

  const validateForm = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return false;
    }
    
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    setErrorMessage('');
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const { error, data } = await signup(email, password, fullName);
      
      if (error) {
        setErrorMessage(error.message || 'An error occurred during signup');
        setIsProcessing(false);
        return;
      }
      
      // If we have a quiz result ID, associate it with the user
      if (quizResultId) {
        // Store in session storage to be handled after email verification
        const quizData = {
          resultId: quizResultId
        };
        sessionStorage.setItem('pendingQuizConnection', JSON.stringify(quizData));
        
        toast({
          title: "Account created!",
          description: "Please verify your email. Your quiz results will be connected to your account when you log in.",
        });
      }
      
      if (data?.redirectTo) {
        navigate(data.redirectTo, { state: data.redirectState || {} });
      }
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMessage(err.message || 'An error occurred during signup');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const navigateToLogin = () => {
    const queryParams = quizResultId ? `?quizResultId=${quizResultId}` : '';
    navigate(`/login${queryParams}`);
  };

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <User className="h-6 w-6 text-sinner-red" />
                <span>Create an Account</span>
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter your information to create an account
                {quizResultId && (
                  <p className="mt-1 text-sm text-sinner-red">Your custom training plan will be saved to your account</p>
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
              
              <form onSubmit={handleSignup}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
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
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
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
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-sinner-red hover:bg-red-700" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
              
              <div className="mt-4 text-center text-sm">
                <p className="text-gray-400">
                  By signing up, you agree to our{" "}
                  <a href="/terms" className="underline text-primary hover:text-primary/90">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline text-primary hover:text-primary/90">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Separator className="bg-gray-800" />
              <div className="text-center w-full">
                <span className="text-gray-400">Already have an account?</span>{" "}
                <button 
                  onClick={navigateToLogin}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Signup;
