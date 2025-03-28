
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  subject: z.string().min(3, {
    message: "Subject must be at least 3 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Store the form submission in the database
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: null, // For anonymous submissions
          subject: data.subject,
          message: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\n\n${data.message}`,
          type: 'contact_form',
          status: 'open',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      
      form.reset();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Have questions about our services or need more information? Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col order-2 md:order-1">
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sinner-red font-semibold mb-1">Email</p>
                    <a href="mailto:info@surrenderedsinnerfitness.com" className="text-gray-300 hover:text-white transition">
                      info@surrenderedsinnerfitness.com
                    </a>
                  </div>
                  
                  <div>
                    <p className="text-sinner-red font-semibold mb-1">Phone</p>
                    <a href="tel:+10000000000" className="text-gray-300 hover:text-white transition">
                      (000) 000-0000
                    </a>
                  </div>
                  
                  <div>
                    <p className="text-sinner-red font-semibold mb-1">Location</p>
                    <address className="text-gray-300 not-italic">
                      Houston, Texas
                    </address>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <h3 className="text-xl font-bold mb-4">Business Hours</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="text-white">6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saturday</span>
                    <span className="text-white">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sunday</span>
                    <span className="text-white">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 order-1 md:order-2">
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <h3 className="text-xl font-bold mb-4">Send Us a Message</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your name" 
                                className="bg-zinc-800 border-zinc-700" 
                                {...field} 
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
                                placeholder="Your email" 
                                type="email" 
                                className="bg-zinc-800 border-zinc-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your phone number" 
                                className="bg-zinc-800 border-zinc-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Message subject" 
                                className="bg-zinc-800 border-zinc-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your message" 
                              className="bg-zinc-800 border-zinc-700 min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-sinner-red hover:bg-red-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                    
                    <FormDescription className="text-center text-gray-400 text-sm">
                      We'll never share your information with third parties.
                    </FormDescription>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
