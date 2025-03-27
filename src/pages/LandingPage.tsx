
import React from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import FloatingCTA from '@/components/FloatingCTA';
import TrainingPackages from '@/components/TrainingPackages';
import { Helmet } from 'react-helmet-async';

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Fitness Training | Professional Training Services</title>
        <meta name="description" content="Professional fitness training services to help you achieve your health and fitness goals." />
      </Helmet>
      <SEO 
        title="Fitness Training | Professional Training Services"
        description="Professional fitness training services to help you achieve your health and fitness goals."
      />
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <Hero />
        <About />
        <Services />
        <TrainingPackages />
        <Testimonials />
        <Contact />
        <Footer />
        <FloatingCTA />
      </div>
    </>
  );
};

export default LandingPage;
