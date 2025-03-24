
import { useState, useEffect, useRef } from "react";
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

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const { login, isAuthenticated, profile, isLoading, isInitialized } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const mountedRef = useRef(true);

  // Setup cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Redirect if already authenticated - use conditional checking with a ref to prevent state updates after unmount
  useEffect(() => {
    if (isInitialized && isAuthenticated && profile?.email_confirmed) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, profile, navigate, isInitialized]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const result = await login(values.email, values.password);
      
      if (result.error) {
        setLoginError(result.error.message || "Login failed. Please try again.");
      } 
      // No else block with navigation - let the useEffect handle redirects
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Display a simplified loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
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

        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your email and password to login
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loginError && (
              <div className="bg-red-900/30 border border-red-800 text-white p-3 rounded-md mb-4 flex items-start">
                <AlertCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{loginError}</p>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            placeholder="Enter your password"
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

                <Button disabled={isSubmitting || isLoading} type="submit" className="w-full">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Logging In...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-sinner-red hover:underline font-semibold">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Forgot your password?{" "}
              <Link to="/reset-password" className="text-sinner-red hover:underline font-semibold">
                Reset password
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-gray-500">
          <p className="text-xs">
            <AlertCircleIcon className="inline-block h-4 w-4 mr-1 align-middle" />
            By signing in, you agree to our{" "}
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
