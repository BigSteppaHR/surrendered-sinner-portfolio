
import React, { useState } from 'react';
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube } from 'lucide-react';
import GlassCard from './GlassCard';
import { useEmail } from '@/hooks/useEmail';

const Contact: React.FC = () => {
  const { sendEmail, isLoading } = useEmail();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      return;
    }

    const programSelection = formData.program ? formData.program : 'Not specified';
    
    const result = await sendEmail({
      to: 'info@surrenderedsinner.com', // Replace with your actual email
      subject: `New Consultation Request from ${formData.name}`,
      html: `
        <h1>New Consultation Request</h1>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Program Interest:</strong> ${programSelection}</p>
        <p><strong>Goals:</strong> ${formData.message}</p>
      `,
    });

    if (result.success) {
      // Also send a confirmation email to the client
      await sendEmail({
        to: formData.email,
        subject: 'We Received Your Consultation Request',
        html: `
          <h1>Thank You for Contacting Surrendered Sinner</h1>
          <p>Dear ${formData.name},</p>
          <p>We have received your consultation request and will be in touch within 24 hours to schedule your free consultation.</p>
          <p>Here's a summary of what you shared with us:</p>
          <ul>
            <li><strong>Program Interest:</strong> ${programSelection}</li>
            <li><strong>Your Goals:</strong> ${formData.message}</li>
          </ul>
          <p>If you have any immediate questions, please don't hesitate to call us at (555) 123-4567.</p>
          <p>Looking forward to helping you on your fitness journey,</p>
          <p>The Surrendered Sinner Team</p>
        `,
      });

      setFormSubmitted(true);
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        program: '',
        message: '',
      });
    }
  };

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-sinner-dark-gray to-black noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">GET <span className="text-sinner-red">IN TOUCH</span></h2>
          <p className="text-lg text-white/80">
            Ready to transform your fitness journey? Contact us today to get started or learn more about our programs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <GlassCard className="h-full">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-sinner-red/20 p-2 rounded-lg mr-3">
                    <MapPin className="h-5 w-5 text-sinner-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Location</h4>
                    <p className="text-white/70">123 Fitness Ave, Strength City, CA 90210</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-sinner-red/20 p-2 rounded-lg mr-3">
                    <Phone className="h-5 w-5 text-sinner-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-white/70">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-sinner-red/20 p-2 rounded-lg mr-3">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-white/70">info@surrenderedsinner.com</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-sinner-red/20 hover:bg-sinner-red/30 p-3 rounded-full transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="bg-sinner-red/20 hover:bg-sinner-red/30 p-3 rounded-full transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="bg-sinner-red/20 hover:bg-sinner-red/30 p-3 rounded-full transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </GlassCard>
          </div>
          
          <div>
            <GlassCard className="h-full">
              <h3 className="text-2xl font-bold mb-6">Book Your Free Consultation</h3>
              
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="bg-green-500/20 p-4 rounded-lg mb-4">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                    <p className="text-white/80">Your consultation request has been sent.</p>
                  </div>
                  <p className="mb-4">We've sent a confirmation to your email.</p>
                  <p className="text-white/70">We'll contact you within 24 hours to schedule your free consultation.</p>
                  <button 
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 bg-sinner-red/20 text-white px-6 py-2 rounded-md hover:bg-sinner-red/40 transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sinner-red transition-colors"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sinner-red transition-colors"
                        placeholder="Your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sinner-red transition-colors"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="program" className="block text-sm font-medium text-white/80 mb-1">
                      Interested In
                    </label>
                    <select
                      id="program"
                      className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sinner-red transition-colors"
                      value={formData.program}
                      onChange={handleChange}
                    >
                      <option value="" className="bg-sinner-dark-gray">Select a program</option>
                      <option value="personal-training" className="bg-sinner-dark-gray">1:1 Personal Training</option>
                      <option value="nutrition" className="bg-sinner-dark-gray">Nutrition Plan</option>
                      <option value="program" className="bg-sinner-dark-gray">Lifting Program</option>
                      <option value="complete" className="bg-sinner-dark-gray">Complete Package</option>
                      <option value="not-sure" className="bg-sinner-dark-gray">Not Sure Yet</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-1">
                      Tell Us About Your Goals
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sinner-red transition-colors"
                      placeholder="I want to..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-sinner-red text-white font-semibold py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sinner-red pulse-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Schedule Free Consultation"
                    )}
                  </button>
                  <p className="text-center text-white/50 text-sm mt-4">
                    No obligation. We'll contact you within 24 hours to schedule your call.
                  </p>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
