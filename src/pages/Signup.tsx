
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, AlertCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const { signup, isAuthenticated, isLoading, isInitialized } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, isInitialized]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    setSignupError(null);
    
    try {
      const result = await signup(values.email, values.password, values.fullName);
      
      if (result.error) {
        setSignupError(result.error.message || "There was a problem creating your account");
      } else {
        // On successful signup, show message about verification email
        toast({
          title: "Account created",
          description: "Please check your email to verify your account",
        });
        
        // Instead of redirecting to confirm-email page, we'll just redirect to login
        navigate("/login", { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (!isInitialized || (isLoading && !isSubmitting)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
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

        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your details to create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {signupError && (
              <div className="bg-red-900/30 border border-red-800 text-white p-3 rounded-md mb-4 flex items-start">
                <AlertCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{signupError}</p>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            {...field}
                          />
                          <span
                            className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4 text-gray-500" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-500" />
                            )}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                          />
                          <span
                            className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOffIcon className="h-4 w-4 text-gray-500" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-500" />
                            )}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button disabled={isSubmitting} type="submit" className="w-full">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Creating Account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-gray-400 w-full text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-sinner-red hover:underline font-semibold">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-gray-500">
          <p className="text-xs">
            <AlertCircleIcon className="inline-block h-4 w-4 mr-1 align-middle" />
            By signing up, you agree to our{" "}
            <a href="#" className="text-sinner-red hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-sinner-red hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
