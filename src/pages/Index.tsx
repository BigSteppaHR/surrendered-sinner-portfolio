
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import VeteransWall from '@/components/VeteransWall';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import FloatingCTA from '@/components/FloatingCTA';

const Index = () => {
  useEffect(() => {
    document.title = 'Surrendered Sinner Fitness | Elite Coaching';
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Enhanced section dividers */}
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <About />
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <Services />
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <Testimonials />
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <VeteransWall />
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <Contact />
      <Footer />
      
      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
};

export default Index;
