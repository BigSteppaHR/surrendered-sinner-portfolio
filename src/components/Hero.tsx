
import React, { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import AnimatedText from './AnimatedText';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden noise-bg">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black to-black z-10"></div>
        <div 
          className="w-full h-full bg-cover bg-center opacity-30"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80")',
          }}
        ></div>
      </div>

      <div className="container-custom relative z-10 mt-20 flex flex-col items-center text-center">
        <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'} mb-6`}>
          <img 
            src="/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png" 
            alt="Surrendered Sinner Fitness Logo" 
            className="w-64 md:w-80 mb-6 red-glow"
          />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight">
          <span className="text-sinner-red animate-text-flicker text-shadow">TRANSFORM</span>
          <span className="text-white"> YOUR</span>
          <br />
          <span className="text-sinner-blue text-shadow-blue">LIMITS</span>
        </h1>

        <div className="max-w-2xl mx-auto">
          <AnimatedText 
            text="Elite fitness coaching that pushes boundaries and breaks barriers." 
            className="text-xl md:text-2xl mb-8 text-white/90"
            delay={0.5}
          />
        </div>

        <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a href="#services" className="btn-primary">
              Explore Programs
            </a>
            <a href="#contact" className="btn-outline">
              Get Started
            </a>
          </div>
        </div>

        <div className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <a href="#about" className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
            <span className="mb-2 text-sm">Discover More</span>
            <ArrowDown className="w-5 h-5 animate-pulse-slow" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
