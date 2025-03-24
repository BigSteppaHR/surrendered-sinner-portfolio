
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormProps = {
  onSubmit: (values: z.infer<typeof loginSchema>) => Promise<void>;
  isSubmitting: boolean;
  isLoading: boolean;
  loginError: string | null;
};

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  isLoading,
  loginError 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                      disabled={isSubmitting || isLoading}
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
                        disabled={isSubmitting || isLoading}
                      />
                      <span
                        className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                        onClick={() => !isSubmitting && !isLoading && setShowPassword(!showPassword)}
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
  );
};

export default LoginForm;
