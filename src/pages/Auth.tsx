import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Lock, Mail, User, ArrowLeft, KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { isAuthenticated, login, signup, resetPassword, updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const from = (location.state as any)?.from?.pathname || "/dashboard";
  
  const [activeTab, setActiveTab] = useState("login");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    const verify = searchParams.get("verify");
    const reset = searchParams.get("reset");
    
    if (verify === "success") {
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now log in.",
      });
      setActiveTab("login");
    }
    
    if (reset === "true") {
      setActiveTab("updatePassword");
    }
  }, [searchParams, toast]);
  
  if (isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    
    try {
      const { error } = await login(loginEmail, loginPassword);
      if (!error) {
        navigate(from);
      }
    } finally {
      setIsLoginLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignupLoading(true);
    
    try {
      const { error } = await signup(signupEmail, signupPassword, signupFullName);
      if (!error) {
        setSignupSuccess(true);
        setSignupEmail("");
        setSignupPassword("");
        setSignupFullName("");
        setTimeout(() => {
          setActiveTab("login");
        }, 3000);
      }
    } finally {
      setIsSignupLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setResetEmail("");
      setActiveTab("login");
    } finally {
      setIsResetLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      const { error } = await updatePassword(newPassword);
      if (!error) {
        setNewPassword("");
        setConfirmPassword("");
        setActiveTab("login");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            SURRENDERED<span className="text-red-600">SINNER</span>
          </h1>
          <p className="text-gray-400 mt-2">Elite fitness coaching</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
            <TabsTrigger value="reset" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Reset
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="bg-gray-900 text-white border-gray-800">
              <CardHeader>
                <CardTitle>Login to Your Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 text-xs text-gray-400"
                        onClick={() => setActiveTab("reset")}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoginLoading}>
                    {isLoginLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card className="bg-gray-900 text-white border-gray-800">
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your information to create a new account
                </CardDescription>
              </CardHeader>
              {signupSuccess ? (
                <CardContent className="space-y-4">
                  <Alert className="bg-green-800 border-green-700 text-white">
                    <AlertTitle>Account Created Successfully!</AlertTitle>
                    <AlertDescription>
                      Please check your email to verify your account. You will be redirected to the login page shortly.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              ) : (
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <Alert className="bg-gray-800 border-gray-700 text-gray-300">
                      <AlertTitle>Verification Required</AlertTitle>
                      <AlertDescription>
                        After signing up, you'll need to verify your email before logging in.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 bg-gray-800 border-gray-700"
                          value={signupFullName}
                          onChange={(e) => setSignupFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 bg-gray-800 border-gray-700"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="signupPassword"
                          type="password"
                          className="pl-10 bg-gray-800 border-gray-700"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSignupLoading}>
                      {isSignupLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create Account
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="reset">
            <Card className="bg-gray-900 text-white border-gray-800">
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your email to receive a password reset link
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={isResetLoading}>
                    {isResetLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sending Reset Link...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Send Reset Link
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2 border-gray-700 text-gray-300"
                    onClick={() => setActiveTab("login")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="updatePassword">
            <Card className="bg-gray-900 text-white border-gray-800">
              <CardHeader>
                <CardTitle>Set New Password</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your new password below
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="newPassword"
                        type="password"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Updating Password...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Update Password
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <Button variant="link" className="text-gray-400 hover:text-white" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
