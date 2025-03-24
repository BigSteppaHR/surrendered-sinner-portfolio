
import React, { useEffect } from 'react';

interface CalendlySchedulerProps {
  url?: string;
  className?: string;
}

const CalendlyScheduler: React.FC<CalendlySchedulerProps> = ({
  url = "https://calendly.com/surrenderedsinnerfitness",
  className = "min-h-[650px] w-full border border-gray-800 rounded-lg",
}) => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={className}>
      <div 
        className="calendly-inline-widget w-full h-full" 
        data-url={url}
      ></div>
    </div>
  );
};

export default CalendlyScheduler;
