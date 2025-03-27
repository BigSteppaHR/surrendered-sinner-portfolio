
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from 'lucide-react';
import CalendlyScheduler from '@/components/CalendlyScheduler';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/safe-dialog";

const ScheduleSession = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sinner-red" />
          Schedule a Session
        </CardTitle>
        <CardDescription className="text-gray-400">Book a training session with your coach</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="bg-black/40 rounded-lg p-4 mb-4 border border-zinc-800">
            <div className="flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-sinner-red mr-2" />
              <h3 className="font-semibold">Next Available Times</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between items-center bg-zinc-800/30 p-2 rounded">
                <span>Today</span>
                <span className="font-semibold text-sinner-red">2:00 PM, 4:30 PM</span>
              </li>
              <li className="flex justify-between items-center bg-zinc-800/30 p-2 rounded">
                <span>Tomorrow</span>
                <span className="font-semibold text-white">10:00 AM, 3:30 PM</span>
              </li>
            </ul>
          </div>
          
          <p className="mb-4 text-gray-300">
            Ready to take your training to the next level? Schedule a session with your coach.
          </p>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-sinner-red hover:bg-red-700 font-semibold w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Now
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] p-0 bg-zinc-900 border-zinc-800">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold flex items-center">
                  <Calendar className="h-5 w-5 text-sinner-red mr-2" />
                  Book Your Training Session
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Select a date and time that works best for you
                </p>
              </div>
              <div className="h-[650px]">
                <CalendlyScheduler 
                  url="https://calendly.com/surrenderedsinnerfitness" 
                  className="h-full w-full border-0" 
                  onEventScheduled={() => setDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleSession;
