import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import VeteransWall from '@/components/VeteransWall';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import SEO from '@/components/SEO';
import FeaturedProducts from '@/components/FeaturedProducts';
import { Button } from '@/components/ui/button';
import { Dumbbell, Target, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import TrainingPackages from '@/components/TrainingPackages';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
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
    if (isAuthenticated) {
      navigate('/dashboard/plans?showQuiz=true');
    } else {
      navigate('/signup', { state: { redirectAfterLogin: '/dashboard/plans?showQuiz=true' } });
    }
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
            className="bg-sinner-red hover:bg-red-700 text-white group relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sinner-red via-red-600 to-sinner-red bg-[length:200%_100%] animate-shimmer"></span>
            <span className="relative flex items-center">
              Take the Quiz <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
      
      <About />
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <Services />
      
      {/* Middle Quiz CTA */}
      <div className="w-full bg-zinc-900 py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-block p-3 bg-black/50 rounded-full mb-4 border border-sinner-red/20 shadow-[0_0_15px_rgba(234,56,76,0.2)]">
            <Target className="h-10 w-10 text-sinner-red" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Not Sure Which Training Plan Is Right For You?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Take our quick fitness assessment quiz and get a personalized recommendation 
            based on your goals, experience, and preferences.
          </p>
          <Button 
            onClick={handleStartPlanQuiz}
            size="lg"
            className="bg-sinner-red hover:bg-red-700 text-white px-8 group shadow-[0_0_15px_rgba(234,56,76,0.3)] relative overflow-hidden"
          >
            <span className="absolute inset-0 w-0 bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300 ease-out group-hover:w-full"></span>
            <span className="relative flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Get Your Custom Plan 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      {/* Add our Training Packages component */}
      <TrainingPackages />
      
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
      
      {/* Bottom Quiz CTA */}
      <div className="w-full bg-black py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,56,76,0.1),transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 text-sinner-red mr-2" />
            Ready to Transform Your Fitness Journey?
            <Zap className="h-5 w-5 text-sinner-red ml-2" />
          </h3>
          <p className="text-gray-300 mb-6">
            Our custom training plans are designed specifically for your body, goals, and lifestyle.
          </p>
          <Button 
            onClick={handleStartPlanQuiz}
            className="bg-sinner-red hover:bg-red-700 text-white relative shadow-[0_0_10px_rgba(234,56,76,0.3)] group overflow-hidden"
          >
            <span className="absolute -inset-[100%] w-[400%] h-[200%] rotate-45 translate-x-[-98%] bg-white/10 group-hover:translate-x-[60%] transition-transform duration-700 ease-in-out"></span>
            <span className="relative flex items-center">
              Create Your Plan Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
      
      <Contact />
      
      <Footer />
    </div>
  );
};

export default Index;
