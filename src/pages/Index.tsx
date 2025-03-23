
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    document.title = 'Surrendered Sinner Fitness | Elite Coaching';
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      {/* Add section dividers between each section */}
      <div className="w-full h-8 bg-sinner-red/10"></div>
      <About />
      <div className="w-full h-8 bg-sinner-red/10"></div>
      <Services />
      <div className="w-full h-8 bg-sinner-red/10"></div>
      <Testimonials />
      <div className="w-full h-8 bg-sinner-red/10"></div>
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
