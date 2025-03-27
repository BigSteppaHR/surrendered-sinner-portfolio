
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    setResetError(null);
    
    try {
      const { error } = await resetPassword(values.email);
      
      if (error) {
        setResetError(error.message || "Could not send password reset email. Please try again.");
        return;
      }
      
      setIsSuccess(true);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions.",
      });
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 5000);
      
    } catch (error: any) {
      setResetError(error?.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-0 bg-black/70 backdrop-blur-md shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="bg-blue-900/20 text-blue-500 p-3 rounded-full inline-flex mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
          <p className="text-gray-400 mb-4">
            We've sent you an email with instructions to reset your password.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Returning to login in a moment...
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin}
            className="w-full border-[#ea384c] text-[#ea384c] hover:bg-[#ea384c]/10"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-black/70 backdrop-blur-md shadow-xl">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Reset Your Password</h3>
          <p className="text-gray-400">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
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
            
            {resetError && (
              <div className="px-3 py-2 rounded bg-red-950/50 border border-red-900 text-red-400 text-sm">
                {resetError}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#ea384c] to-[#d31e38] hover:from-[#d31e38] hover:to-[#b01a30]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset email...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="text-gray-400 hover:text-white"
                onClick={onBackToLogin}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;
