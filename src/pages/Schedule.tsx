
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import CalendlyScheduler from '@/components/CalendlyScheduler';

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
              <CalendlyScheduler />
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-bold mb-4">What to Expect</h2>
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
              
              <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold mb-2">Need Immediate Assistance?</h3>
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
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Schedule;
