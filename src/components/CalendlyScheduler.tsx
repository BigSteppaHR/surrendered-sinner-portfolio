
import React, { useEffect, useState } from 'react';
import { Loader2, Calendar, Clock } from 'lucide-react';

interface CalendlySchedulerProps {
  url?: string;
  className?: string;
  onEventScheduled?: () => void;
}

const CalendlyScheduler: React.FC<CalendlySchedulerProps> = ({
  url = "https://calendly.com/surrenderedsinnerfitness",
  className = "min-h-[650px] w-full border border-gray-800 rounded-lg",
  onEventScheduled
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Add event listener for Calendly events
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event === 'calendly.event_scheduled') {
        onEventScheduled?.();
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    script.onload = () => {
      setTimeout(() => setIsLoading(false), 1000);
    };

    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [onEventScheduled]);

  return (
    <div className={className}>
      {isLoading && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
          <Loader2 className="h-12 w-12 text-sinner-red animate-spin mb-4" />
          <div className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-sinner-red" />
            <span>Loading scheduler...</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
        </div>
      )}
      <div 
        className="calendly-inline-widget w-full h-full" 
        data-url={url}
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}
      ></div>
    </div>
  );
};

export default CalendlyScheduler;
