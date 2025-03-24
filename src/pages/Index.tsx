
import React, { useEffect, useState } from 'react';
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
import AssessmentQuiz from '@/components/AssessmentQuiz';
import SEO from '@/components/SEO';

const Index = () => {
  const [quizOpen, setQuizOpen] = useState(false);
  
  // Set up a hash change listener to show the quiz when the URL hash is #assessment-quiz
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#assessment-quiz') {
        setQuizOpen(true);
      }
    };

    // Check on initial load
    handleHashChange();

    // Add listener for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Clean up
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Determine if we're on codecove.dev
  const isCodecove = typeof window !== 'undefined' && 
    (window.location.hostname === 'codecove.dev' || 
     window.location.hostname.endsWith('.codecove.dev'));

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        canonical={isCodecove ? 'https://codecove.dev' : 'https://surrenderedsinnerfitness.com'}
      />
      
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

      {/* Assessment Quiz Modal */}
      <AssessmentQuiz isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
};

export default Index;
