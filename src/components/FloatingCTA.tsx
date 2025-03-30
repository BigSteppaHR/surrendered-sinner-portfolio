
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const FloatingCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the CTA when user has scrolled 60% down the page
      if (window.scrollY > window.innerHeight * 0.6 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Add a delay before first showing
    const timer = setTimeout(() => {
      handleScroll();
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
      <div className="glass-dark p-4 rounded-lg shadow-xl border border-sinner-red/30">
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center mb-3">
          <img 
            src="/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png" 
            alt="Surrendered Sinner FIT Logo" 
            className="w-8 h-8 mr-2"
          />
          <h4 className="font-bold text-lg">Ready to Transform?</h4>
        </div>
        
        <p className="text-white/80 text-sm mb-3">
          Take the first step today with a free consultation. Discover how we can help you achieve your fitness goals.
        </p>
        
        {/* Using an anchor tag with href for simple page scroll instead of Link for hash navigation */}
        <a 
          href="#contact" 
          className="w-full block text-center bg-sinner-red text-white font-semibold py-2 px-4 rounded-md hover:bg-sinner-red/90 transition-colors pulse-glow"
        >
          Book Free Consultation
        </a>
      </div>
    </div>
  );
};

export default FloatingCTA;
