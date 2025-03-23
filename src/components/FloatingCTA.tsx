
import React, { useState, useEffect } from 'react';
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
        
        <h4 className="font-bold text-lg mb-2">Ready to Transform?</h4>
        <p className="text-white/80 text-sm mb-3">
          Take the first step today with a free consultation. Discover how we can help you achieve your fitness goals.
        </p>
        
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
