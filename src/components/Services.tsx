
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Users, Timer, Target, Zap, HeartPulse } from 'lucide-react';
import GlassCard from './GlassCard';
import CustomPlanQuiz from './CustomPlanQuiz';

const Services = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-black to-zinc-900 noise-bg">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            <span>Specialized</span> <span className="text-sinner-red">Training</span>
          </h2>
          <p className="mt-4 text-white/80">
            Find the program that's right for you. Our proven methods deliver exceptional results through personalized plans and dedicated coaching.
          </p>
          
          {/* Add the custom plan quiz button */}
          <div className="mt-6">
            <CustomPlanQuiz />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <GlassCard
            icon={<Dumbbell className="h-8 w-8 text-sinner-red" />}
            title="Strength Training"
            description="Building physical strength through progressive resistance training tailored to your goals."
            className="border-t-sinner-red"
          />

          <GlassCard
            icon={<HeartPulse className="h-8 w-8 text-sinner-red" />}
            title="Cardiovascular Health"
            description="Improving heart and lung capacity with targeted endurance and HIIT protocols."
            className="border-t-sinner-red"
          />

          <GlassCard
            icon={<Zap className="h-8 w-8 text-sinner-red" />}
            title="Performance Enhancement"
            description="Taking your physical capabilities to the next level with advanced techniques."
            className="border-t-sinner-red"
          />

          <GlassCard
            icon={<Users className="h-8 w-8 text-sinner-red" />}
            title="Group Training"
            description="Experience the motivational power of community through small group sessions."
            className="border-t-sinner-red"
          />

          <GlassCard
            icon={<Target className="h-8 w-8 text-sinner-red" />}
            title="Specialized Programs"
            description="Custom programming for specific sports, goals, or rehabilitation needs."
            className="border-t-sinner-red"
          />

          <GlassCard
            icon={<Timer className="h-8 w-8 text-sinner-red" />}
            title="Lifestyle Integration"
            description="Fitness solutions that work with your schedule for sustainable long-term results."
            className="border-t-sinner-red"
          />
        </div>
      </div>
    </section>
  );
};

export default Services;
