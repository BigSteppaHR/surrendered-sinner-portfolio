
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
import SEO from '@/components/SEO';
import FeaturedProducts from '@/components/FeaturedProducts';
import { Button } from '@/components/ui/button';
import { Dumbbell, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  // Determine if we're on codecove.dev
  const isCodecove = typeof window !== 'undefined' && 
    (window.location.hostname === 'codecove.dev' || 
     window.location.hostname.includes('codecove.dev') ||
     window.location.hostname === 'localhost' ||
     window.location.hostname.includes('localhost'));

  // Determine the canonical URL safely
  const canonicalUrl = isCodecove 
    ? 'https://codecove.dev'
    : 'https://surrenderedsinnerfitness.com';
    
  const handleStartPlanQuiz = () => {
    navigate('/dashboard/plans?showQuiz=true');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Surrendered Sinner Fitness | Elite Coaching"
        description="Transform your body and mind with elite coaching from Surrendered Sinner Fitness."
        canonical={canonicalUrl}
      />
      
      <Navbar />
      <Hero />
      
      {/* Enhanced section dividers */}
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      {/* Top Quiz CTA */}
      <div className="w-full bg-black py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Dumbbell className="h-6 w-6 text-sinner-red mr-2" />
            <h3 className="text-xl font-bold text-white">Find Your Perfect Training Plan</h3>
          </div>
          <Button 
            onClick={handleStartPlanQuiz}
            className="bg-sinner-red hover:bg-red-700 text-white"
          >
            Take the Quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <About />
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <Services />
      
      {/* Middle Quiz CTA */}
      <div className="w-full bg-zinc-900 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Target className="h-12 w-12 text-sinner-red mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Not Sure Which Training Plan Is Right For You?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Take our quick fitness assessment quiz and get a personalized recommendation 
            based on your goals, experience, and preferences.
          </p>
          <Button 
            onClick={handleStartPlanQuiz}
            size="lg"
            className="bg-sinner-red hover:bg-red-700 text-white px-8"
          >
            Get Your Custom Plan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
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
      
      {/* Add Featured Products section */}
      <FeaturedProducts />
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <Contact />
      
      {/* Bottom Quiz CTA */}
      <div className="w-full bg-black py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Ready to Transform Your Fitness Journey?</h3>
          <p className="text-gray-300 mb-6">
            Our custom training plans are designed specifically for your body, goals, and lifestyle.
          </p>
          <Button 
            onClick={handleStartPlanQuiz}
            className="bg-sinner-red hover:bg-red-700 text-white"
          >
            Create Your Plan Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Footer />
      
      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
};

export default Index;
