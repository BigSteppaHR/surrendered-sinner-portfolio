
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventsSection from '@/components/EventsSection';
import { Separator } from '@/components/ui/separator';
import SEO from '@/components/SEO';

const Events = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Events & Clinics | Surrendered Sinner Fitness"
        description="Join our in-person and virtual fitness events, workshops, and clinics."
        canonical="https://surrenderedsinnerfitness.com/events"
      />
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="py-16 bg-zinc-900">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
              Events & <span className="text-[#ea384c]">Clinics</span>
            </h1>
            <p className="mt-4 text-gray-400 text-center max-w-3xl mx-auto">
              Join us for exclusive training events, nutrition workshops, and coaching clinics 
              both in-person and online to take your fitness journey to the next level.
            </p>
          </div>
        </div>
        
        <Separator className="bg-[#333]" />
        
        <EventsSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
