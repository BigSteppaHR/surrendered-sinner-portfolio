
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/useEmail';
import { Profile } from '@/hooks/useAuth';

export const useAuthOperations = () => {
  const { toast } = useToast();
  const { sendEmail } = useEmail();

  const refreshProfile = async (user: User | null) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Check for specific email provider disabled error
        if (error.message.includes("Email logins are disabled")) {
          toast({
            title: "Email authentication disabled",
            description: "Email authentication is currently disabled in this application. Please contact the administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message || "There was a problem logging in",
            variant: "destructive",
          });
        }
        return { error };
      }
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast({
        title: "Login failed",
        description: error.message || "There was a problem logging in",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      // First check if the user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please login instead.",
          variant: "destructive",
        });
        return { error: { message: "Account already exists" }, data: null };
      }

      // Create the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        // Check for specific email provider disabled error
        if (error.message.includes("Email signups are disabled")) {
          toast({
            title: "Email authentication disabled",
            description: "Email registration is currently disabled in this application. Please contact the administrator.",
            variant: "destructive",
          });
          return { error, data: null };
        }
        
        throw error;
      }
      
      // Generate a verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Store the verification token in the verification_tokens table
      const { error: tokenError } = await supabase
        .from('verification_tokens')
        .insert({ 
          user_email: email, 
          token: verificationToken, 
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });
      
      if (tokenError) {
        console.error('Error storing verification token:', tokenError);
      }
      
      // Create the verification URL - direct API call, not a page redirect
      const BASE_URL = window.location.origin;
      const verificationApiUrl = `${BASE_URL}/api/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      console.log("Generated verification URL:", verificationApiUrl);
      
      // Send the verification email using our custom function
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: "Welcome to Surrendered Sinner - Please Verify Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h1 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Welcome to Surrendered Sinner</h1>
              <p>Hi ${fullName},</p>
              <p>Thank you for signing up for Surrendered Sinner. We're excited to have you join our elite fitness coaching platform.</p>
              <p>Before you can access your account, please verify your email address by clicking the link below:</p>
              <p style="text-align: center;">
                <a href="${verificationApiUrl}" 
                   style="background-color: #e32400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                  Verify My Email
                </a>
              </p>
              <p>If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
              <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${verificationApiUrl}
              </p>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not sign up for this account, please ignore this email.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
                <p>Surrendered Sinner Elite Fitness Coaching</p>
                <p>&copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        
        console.log('Verification email sent successfully to:', email, emailResult);
        
        if (!emailResult.success) {
          console.error('Email sending failed with response:', emailResult);
          toast({
            title: "Warning",
            description: "Account created but verification email could not be sent. Please contact support.",
            variant: "destructive",
          });
        }
      } catch (emailError: any) {
        console.error('Error sending verification email:', emailError);
        toast({
          title: "Warning",
          description: "Account created but verification email could not be sent. Please contact support.",
          variant: "destructive",
        });
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });
      
      return { error: null, data: { user: data.user, session: data.session, emailSent: true } };
    } catch (error: any) {
      console.error('Signup error:', error.message);
      toast({
        title: "Signup failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      try {
        await sendEmail({
          to: email,
          subject: "Reset Your Surrendered Sinner Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h1 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Reset Your Password</h1>
              <p>Hello,</p>
              <p>We received a request to reset your password for your Surrendered Sinner account.</p>
              <p>You'll receive another email shortly with a link to reset your password. If you didn't request a password reset, you can safely ignore this email.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
                <p>Surrendered Sinner Elite Fitness Coaching</p>
                <p>&copy; ${new Date().getFullYear()} Surrendered Sinner. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      } catch (emailError: any) {
        console.error('Error sending reset password email:', emailError);
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      toast({
        title: "Failed to send reset email",
        description: error.message || "There was a problem sending the reset email",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error.message);
      toast({
        title: "Failed to update password",
        description: error.message || "There was a problem updating your password",
        variant: "destructive",
      });
      return { error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error.message);
      toast({
        title: "Logout failed",
        description: error.message || "There was a problem logging out",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return {
    login,
    signup,
    logout,
    refreshProfile,
    resetPassword,
    updatePassword,
  };
};
