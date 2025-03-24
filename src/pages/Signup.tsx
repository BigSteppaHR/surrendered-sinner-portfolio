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
import { EyeIcon, EyeOffIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmailVerificationDialog from "@/components/email/EmailVerificationDialog";

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const { signup, isAuthenticated, profile, isInitialized } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isInitialized && isAuthenticated && profile?.email_confirmed) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, profile, navigate, isInitialized]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (!mountedRef.current) return;
    
    setIsSubmitting(true);
    setSignupError(null);
    
    try {
      console.log("Submitting signup form for:", values.email);
      const result = await signup(values.email, values.password, values.fullName);
      
      if (!mountedRef.current) return;
      
      if (result.error) {
        console.log("Signup error:", result.error);
        setSignupError(result.error.message || "There was a problem creating your account");
      } else {
        if (result.data?.showVerification) {
          console.log("Showing verification dialog for:", values.email);
          setSignupEmail(values.email);
          setShowEmailVerification(true);
          form.reset();
        }
        
        if (result.data?.redirectTo) {
          setTimeout(() => {
            if (mountedRef.current) {
              console.log("Redirecting to:", result.data?.redirectTo);
              navigate(result.data?.redirectTo as string);
            }
          }, 3000);
        }
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      console.error("Unexpected signup error:", error);
      setSignupError("An unexpected error occurred. Please try again.");
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseVerification = () => {
    if (mountedRef.current) {
      setShowEmailVerification(false);
      navigate("/login");
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated && profile?.email_confirmed) {
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your details to create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {signupError && (
              <div className="bg-red-900/30 border border-red-800 text-white p-3 rounded-md mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
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
                        <Input 
                          type="text" 
                          placeholder="Enter your full name" 
                          {...field}
                          disabled={isSubmitting} 
                        />
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
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          {...field}
                          disabled={isSubmitting} 
                        />
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
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
            <AlertCircle className="inline-block h-4 w-4 mr-1 align-middle" />
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

      {mountedRef.current && (
        <EmailVerificationDialog 
          isOpen={showEmailVerification}
          onClose={handleCloseVerification}
          initialEmail={signupEmail}
          redirectToLogin={true}
        />
      )}
    </div>
  );
}
