
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrainingPackages from '@/components/TrainingPackages';
import { Separator } from '@/components/ui/separator';
import SEO from '@/components/SEO';
import { Dumbbell, Calendar, Target, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CustomPlanQuiz from '@/components/CustomPlanQuiz';

const Plans = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Training Plans | Surrendered Sinner Fitness"
        description="Explore our range of personalized training plans designed to help you achieve your fitness goals."
        canonical="https://surrenderedsinnerfitness.com/plans"
      />
      
      <Navbar />
      
      <div className="relative min-h-[300px] bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-black border border-sinner-red/30 shadow-[0_0_15px_rgba(234,56,76,0.3)]">
            <Dumbbell className="h-8 w-8 text-sinner-red" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
            Training Plans
          </h1>
          
          <p className="text-center text-gray-300 max-w-2xl mb-8">
            Personalized training plans designed to help you achieve your fitness goals.
            Whether you're just starting out or looking to take your fitness to the next level.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <CheckCircle className="h-5 w-5 text-sinner-red" />
              <span>Expert Coaching</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <CheckCircle className="h-5 w-5 text-sinner-red" />
              <span>Personalized Programs</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <CheckCircle className="h-5 w-5 text-sinner-red" />
              <span>Ongoing Support</span>
            </div>
          </div>
        </div>
      </div>
      
      <TrainingPackages />
      
      <div className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
              Why Choose Our Plans
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              The Surrendered Sinner Difference
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our training plans are built on proven methods and personalized to your unique needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <div className="bg-black/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-sinner-red" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Customized Approach</h3>
              <p className="text-gray-400">
                Every plan is tailored to your specific goals, fitness level, and available equipment.
                We don't believe in one-size-fits-all solutions.
              </p>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <div className="bg-black/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-sinner-red" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Progressive Programming</h3>
              <p className="text-gray-400">
                Our plans evolve with you, adjusting as you make progress to ensure continuous improvement
                and prevent plateaus.
              </p>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <div className="bg-black/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-sinner-red" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Expert Coaching</h3>
              <p className="text-gray-400">
                Benefit from our years of experience coaching clients of all levels.
                We know what works and how to get you results efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
                Find Your Perfect Plan
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Not Sure Which Plan Is Right For You?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Take our quick fitness assessment quiz to get a personalized recommendation
              </p>
            </div>
            
            <div className="flex justify-center">
              <CustomPlanQuiz />
            </div>
          </div>
        </div>
      </div>
      
      <div className="section-divider">
        <Separator className="bg-sinner-red/20 h-0.5" />
      </div>
      
      <Footer />
    </div>
  );
};

export default Plans;
