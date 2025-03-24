
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CalendlyScheduler from '@/components/CalendlyScheduler';

const ScheduleSession = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Schedule a Session</CardTitle>
        <CardDescription className="text-gray-400">Book a training session with your coach</CardDescription>
      </CardHeader>
      <CardContent>
        {!expanded ? (
          <div className="text-center">
            <p className="mb-4 text-gray-300">
              Ready to take your training to the next level? Schedule a session with your coach.
            </p>
            <Button 
              onClick={() => setExpanded(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Schedule Now
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setExpanded(false)}
              className="mb-2"
            >
              Hide Scheduler
            </Button>
            <CalendlyScheduler 
              url="https://calendly.com/surrenderedsinnerfitness" 
              className="h-[650px] w-full border border-gray-800 rounded-lg" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleSession;
