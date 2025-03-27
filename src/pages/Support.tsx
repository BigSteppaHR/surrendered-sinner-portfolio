
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, MessageSquare, MailQuestion, Info, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const supportSchema = z.object({
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  message: z.string().min(20, { message: "Message must be at least 20 characters" }),
});

const faqs = [
  {
    question: "What is Surrendered Sinner Fitness?",
    answer: "Surrendered Sinner Fitness is a Christian-based fitness program that focuses on physical, mental and spiritual wellness. We believe in transforming bodies and lives through faith-based fitness principles."
  },
  {
    question: "How do I change my subscription plan?",
    answer: "You can change your subscription plan by navigating to the Payment page in your dashboard. There, you'll find options to upgrade, downgrade, or cancel your current plan."
  },
  {
    question: "Can I pause my membership?",
    answer: "Yes, you can pause your membership for up to 30 days once every 6 months. Navigate to the Account page in your dashboard and select the 'Pause Membership' option."
  },
  {
    question: "How do I track my progress?",
    answer: "Your progress is automatically tracked in the Progress section of your dashboard. You can manually log workouts, weight, measurements, and view charts of your progress over time."
  },
  {
    question: "Where can I find my workout plans?",
    answer: "Your personalized workout plans are located in the Plans section of your dashboard. New workouts are added according to your subscription level."
  }
];

const Support = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const form = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      subject: '',
      category: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof supportSchema>) => {
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a support ticket",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert the support ticket into the database
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: profile.id,
          subject: values.subject,
          category: values.category,
          message: values.message,
          status: 'open',
        })
        .select();
      
      if (error) throw error;
      
      setTicketSubmitted(true);
      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you as soon as possible",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Failed to submit ticket",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - Support Form */}
        <div className="flex-1">
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Contact Support</CardTitle>
              <CardDescription className="text-zinc-400">
                Need help? Submit a ticket and our team will respond as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketSubmitted ? (
                <div className="flex flex-col items-center py-8 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-900/20 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Ticket Submitted Successfully</h3>
                  <p className="text-zinc-400">
                    Thank you for reaching out. Our support team will review your ticket and get back to you soon.
                  </p>
                  <Button 
                    variant="default"
                    className="mt-4 bg-gradient-to-r from-[#ea384c] to-[#d31e38]"
                    onClick={() => setTicketSubmitted(false)}
                  >
                    Submit Another Ticket
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Subject</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Brief description of your issue" 
                              className="bg-zinc-900 border-zinc-800" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                              <SelectItem value="account">Account</SelectItem>
                              <SelectItem value="billing">Billing & Payments</SelectItem>
                              <SelectItem value="subscription">Subscription</SelectItem>
                              <SelectItem value="workouts">Workouts & Plans</SelectItem>
                              <SelectItem value="technical">Technical Issues</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe your issue in detail..." 
                              className="bg-zinc-900 border-zinc-800 min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-4 bg-gradient-to-r from-[#ea384c] to-[#d31e38]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - FAQ and Support Info */}
        <div className="flex-1 space-y-6">
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-white">
                <HelpCircle className="mr-2 h-5 w-5 text-[#ea384c]" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-zinc-800 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full p-4 flex justify-between items-center text-left text-white hover:bg-zinc-900/50 transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <svg
                      className={`h-5 w-5 transform transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === index && (
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 text-zinc-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-white">
                <Info className="mr-2 h-5 w-5 text-[#ea384c]" />
                Support Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 mr-3 text-zinc-500 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Live Chat</h4>
                  <p className="text-zinc-400 text-sm">Available Monday-Friday, 9AM-5PM EST</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MailQuestion className="h-5 w-5 mr-3 text-zinc-500 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">Email Support</h4>
                  <p className="text-zinc-400 text-sm">support@surrenderedsinnerfit.com</p>
                  <p className="text-zinc-500 text-xs mt-1">Response time: 24-48 hours</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-800 bg-zinc-900/30 flex flex-col items-start">
              <p className="text-zinc-400 text-sm mb-2">
                For urgent billing inquiries, please call: <span className="text-white">(555) 123-4567</span>
              </p>
              <p className="text-zinc-500 text-xs">
                Surrendered Sinner Fitness customer support is here to help you on your fitness journey.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;
