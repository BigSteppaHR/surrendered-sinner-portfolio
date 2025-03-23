
import React from 'react';
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube } from 'lucide-react';
import GlassCard from './GlassCard';

const Contact: React.FC = () => {
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
              <form className="space-y-6">
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
                  />
                </div>
                
                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-white/80 mb-1">
                    Interested In
                  </label>
                  <select
                    id="program"
                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sinner-red transition-colors"
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
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-sinner-red text-white font-semibold py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sinner-red pulse-glow"
                >
                  Schedule Free Consultation
                </button>
                <p className="text-center text-white/50 text-sm mt-4">
                  No obligation. We'll contact you within 24 hours to schedule your call.
                </p>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
