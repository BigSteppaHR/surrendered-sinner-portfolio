
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { toast } = useToast();
  const { isAuthenticated, user, login, signup, logout } = useAuth();
  const navigate = useNavigate();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });
  
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Welcome back to your dashboard!",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };
  
  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signup(values.name, values.email, values.password);
      setShowVerificationDialog(true);
      // In a real app, we would send a verification email here
      toast({
        title: "Account Created",
        description: "Please verify your email to complete registration.",
      });
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };
  
  if (isAuthenticated && user) {
    return (
      <>
        <SEO 
          title="My Dashboard | Surrendered Sinner Fitness"
          description="Access your personalized fitness programs, track your progress, and manage your account."
          canonical="https://surrenderedsinnerfitness.com/dashboard"
        />
        
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <header className="bg-black py-4 border-b border-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center">
                <a href="/" className="text-2xl font-bold">
                  <span className="text-white">Surrendered</span> 
                  <span className="text-sinner-red">Sinner</span>
                </a>
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">Welcome, {user.name}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Programs</CardTitle>
                  <CardDescription>View your current training programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">You don't have any active programs yet.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => navigate('/schedule')}>Schedule Consultation</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>My Progress</CardTitle>
                  <CardDescription>Track your fitness journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">No progress data available yet.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Update Metrics</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled training sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">No upcoming sessions scheduled.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => navigate('/schedule')}>Book Session</Button>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </>
    );
  }
  
  return (
    <>
      <SEO 
        title="Client Dashboard | Surrendered Sinner Fitness"
        description="Access your personalized fitness programs, track your progress, and manage your account."
        canonical="https://surrenderedsinnerfitness.com/dashboard"
      />
      
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <header className="bg-black py-4 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <a href="/" className="text-2xl font-bold">
                <span className="text-white">Surrendered</span> 
                <span className="text-sinner-red">Sinner</span>
              </a>
              <nav>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  Return to Home
                </a>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                      Enter your email and password to access your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">
                          Login
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="link" onClick={() => setActiveTab("signup")}>
                      Don't have an account? Sign up
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="signup">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Join Surrendered Sinner Fitness and start your fitness journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="agreeTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I agree to the terms of service and privacy policy
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">
                          Create Account
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="link" onClick={() => setActiveTab("login")}>
                      Already have an account? Login
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-4">
            <p className="text-sm text-gray-400">
              If you don't see the email, please check your spam folder. The verification link will expire in 24 hours.
            </p>
            <Button onClick={() => {
              setShowVerificationDialog(false);
              setActiveTab("login");
            }}>
              I'll verify later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
