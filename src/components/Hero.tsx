
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black z-10"></div>
        <div 
          className="w-full h-full bg-cover bg-center opacity-40"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80")',
          }}
        ></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-sinner-red/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-[40%] right-[10%] w-40 h-40 bg-sinner-red/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[20%] left-[15%] w-36 h-36 bg-sinner-red/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      <div className="container-custom relative z-10 mt-20 flex flex-col items-center text-center">
        <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'} mb-6 relative`}>
          {/* TV static effect only on the outside of the logo */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none" style={{ padding: '10px' }}>
            <div className="absolute inset-0 ring-4 ring-offset-4 ring-offset-transparent ring-sinner-red/40 rounded-full"></div>
            <div className="absolute inset-[-10px] opacity-20 mix-blend-overlay tv-static rounded-full"></div>
          </div>
          
          <img 
            src="/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png" 
            alt="Surrendered Sinner Fitness Logo" 
            className="w-64 md:w-80 mb-6 red-glow animate-pulse-slow z-10 relative"
          />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight">
          <span className="text-sinner-red animate-text-flicker text-shadow-strong">TRANSFORM</span>
          <span className="text-white"> YOUR</span>
          <br />
          <span className="text-sinner-red text-shadow-strong">LIMITS</span>
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
            <a href="#services" className="btn-primary pulse-glow">
              Explore Programs
            </a>
            <a href="#contact" className="btn-secondary">
              Free Consultation
            </a>
          </div>
        </div>

        <div className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <a href="#about" className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
            <span className="mb-2 text-sm">Discover More</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
