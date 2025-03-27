
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import CalendlyScheduler from '@/components/CalendlyScheduler';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, MessageSquare, Shield } from 'lucide-react';

const Schedule = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Schedule a Consultation | Surrendered Sinner Fitness"
        description="Book a free consultation with our fitness experts. Find the perfect program for your goals."
        canonical="https://surrenderedsinnerfitness.com/schedule"
      />
      
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-sinner-dark-gray to-black noise-bg py-16">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">SCHEDULE A <span className="text-sinner-red">CONSULTATION</span></h1>
            <p className="text-lg text-white/80 mb-8">
              Book a time with one of our fitness experts to discuss your goals and find the perfect program for your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-zinc-900/70 border-zinc-800 overflow-hidden shadow-xl">
                <CardContent className="p-0">
                  <CalendlyScheduler 
                    className="min-h-[700px] w-full border-0 rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-zinc-900/70 p-6 rounded-lg border border-zinc-800 shadow-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Calendar className="text-sinner-red mr-2 h-5 w-5" />
                  What to Expect
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-sinner-red mr-3 text-xl">•</span>
                    <p>A 15-minute consultation to understand your fitness goals</p>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sinner-red mr-3 text-xl">•</span>
                    <p>Personalized program recommendations based on your needs</p>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sinner-red mr-3 text-xl">•</span>
                    <p>Transparent pricing information with no obligation</p>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sinner-red mr-3 text-xl">•</span>
                    <p>Answers to any questions you have about our services</p>
                  </li>
                </ul>
              </Card>
              
              <Card className="bg-zinc-900/70 p-6 rounded-lg border border-zinc-800 shadow-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Clock className="text-sinner-red mr-2 h-5 w-5" />
                  Available Hours
                </h2>
                <ul className="space-y-2 text-white/90">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">6:00 AM - 9:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">8:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">8:00 AM - 2:00 PM</span>
                  </li>
                </ul>
                <div className="mt-4 text-sm text-gray-400">
                  <p>* Hours may vary on holidays</p>
                </div>
              </Card>
              
              <Card className="bg-zinc-900/70 p-6 rounded-lg border border-zinc-800 shadow-xl">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <MessageSquare className="text-sinner-red mr-2 h-5 w-5" />
                  Need Immediate Assistance?
                </h2>
                <p className="text-sm text-gray-300 mb-4">
                  If you can't find a suitable time or have urgent questions, reach out directly:
                </p>
                <a 
                  href="mailto:contact@surrenderedsinnerfitness.com" 
                  className="text-sinner-red hover:underline block mb-2"
                >
                  contact@surrenderedsinnerfitness.com
                </a>
                <p className="text-sm text-gray-400">
                  We aim to respond to all inquiries within 24 hours.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Schedule;
