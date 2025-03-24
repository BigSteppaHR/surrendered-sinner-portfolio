
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export const useEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendEmail = async ({ to, subject, text, html, from }: SendEmailParams) => {
    if (!to || !subject || (!text && !html)) {
      toast({
        title: "Error",
        description: "Missing required email fields",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          text,
          html,
          from,
        },
      });

      if (error) {
        console.error('Error sending email:', error);
        toast({
          title: "Failed to send email",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Email sent",
        description: "Your email has been sent successfully",
      });
      return { success: true, data };
    } catch (err) {
      console.error('Exception sending email:', err);
      toast({
        title: "Failed to send email",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading,
  };
};
