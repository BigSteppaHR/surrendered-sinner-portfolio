
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

interface LoginFormProps {
  onSubmit: (values: z.infer<typeof loginSchema>) => Promise<void>;
  isSubmitting: boolean;
  isLoading: boolean;
  loginError: string | null;
  onForgotPassword: () => void;
}

const LoginForm = ({ onSubmit, isSubmitting, isLoading, loginError, onForgotPassword }: LoginFormProps) => {
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    await onSubmit(values);
  };

  return (
    <Card className="border-0 bg-black/70 backdrop-blur-md shadow-xl">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      {...field} 
                      className="bg-zinc-900/70 border-zinc-800"
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
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-white">Password</FormLabel>
                    <Button 
                      variant="link" 
                      className="px-0 text-sinner-red h-auto py-0" 
                      type="button"
                      onClick={onForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="●●●●●●●●" 
                      {...field} 
                      className="bg-zinc-900/70 border-zinc-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {loginError && (
              <div className="px-3 py-2 rounded bg-red-950/50 border border-red-900 text-red-400 text-sm">
                {loginError}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                className="px-1 text-sinner-red h-auto py-0" 
                type="button"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
