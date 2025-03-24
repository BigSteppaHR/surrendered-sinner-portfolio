
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CalendlySchedulerProps {
  url?: string;
  className?: string;
}

const CalendlyScheduler: React.FC<CalendlySchedulerProps> = ({
  url = "https://calendly.com/surrenderedsinnerfitness",
  className = "min-h-[650px] w-full border border-gray-800 rounded-lg",
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Add event listener to detect when Calendly is loaded
    script.onload = () => {
      setTimeout(() => setIsLoading(false), 1000); // Give it a second to initialize
    };

    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={className}>
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-sinner-red animate-spin" />
          <span className="ml-2 text-lg">Loading scheduler...</span>
        </div>
      )}
      <div 
        className="calendly-inline-widget w-full h-full" 
        data-url={url}
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
      ></div>
    </div>
  );
};

export default CalendlyScheduler;
