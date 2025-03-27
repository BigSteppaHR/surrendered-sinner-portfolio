
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Info, MapPin, Users, Dumbbell, Heart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CalendlyScheduler from '@/components/CalendlyScheduler';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/safe-dialog';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';

const Schedule = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const handleEventScheduled = () => {
    setDialogOpen(false);
    toast({
      title: "Session Scheduled",
      description: "Your session has been scheduled successfully.",
      variant: "default",
    });
  };

  const sessionTypes = [
    {
      id: 'initial-assessment',
      name: 'Initial Assessment',
      description: 'A comprehensive evaluation of your fitness level, goals, and limitations.',
      icon: <Target className="h-8 w-8 text-sinner-red" />,
      duration: '60 mins',
      price: 'Free',
      calendlyPath: '/initial-assessment/30min'
    },
    {
      id: 'personal-training',
      name: 'Personal Training',
      description: 'One-on-one coaching sessions tailored to your specific fitness goals.',
      icon: <Dumbbell className="h-8 w-8 text-sinner-red" />,
      duration: '60 mins',
      price: '$75',
      calendlyPath: '/personal-training/60min'
    },
    {
      id: 'nutrition-consult',
      name: 'Nutrition Consultation',
      description: 'Expert guidance on nutrition to complement your training regimen.',
      icon: <Heart className="h-8 w-8 text-sinner-red" />,
      duration: '45 mins',
      price: '$60',
      calendlyPath: '/nutrition-consultation/45min'
    }
  ];

  const handleOpenScheduler = (sessionType: string) => {
    setSelectedSession(sessionType);
    setDialogOpen(true);
  };

  return (
    <>
      <SEO
        title="Schedule a Session | Surrendered Sinner Fitness"
        description="Book your personal training, assessment, or nutrition consultation with Surrendered Sinner Fitness."
        canonical="https://surrenderedsinnerfitness.com/schedule"
      />

      <Navbar />

      <div className="relative min-h-[300px] bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-black border border-sinner-red/30 shadow-[0_0_15px_rgba(234,56,76,0.3)]">
            <Calendar className="h-8 w-8 text-sinner-red" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
            Schedule Your Training Session
          </h1>
          
          <p className="text-center text-gray-300 max-w-2xl mb-8">
            Take the next step in your fitness journey by booking a session with our expert coaches. 
            Choose from various session types tailored to your specific needs.
          </p>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="h-4 w-4 text-sinner-red" />
            <span>Available 7 days a week</span>
            <span className="mx-2">•</span>
            <MapPin className="h-4 w-4 text-sinner-red" />
            <span>In-person & Virtual options</span>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
              Select Your Session Type
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              Choose Your Path to Success
            </h2>
            <p className="text-gray-400 text-center max-w-2xl">
              Select the type of session that best aligns with your fitness goals and preferences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionTypes.map((session) => (
              <Card key={session.id} className="bg-zinc-800 border-zinc-700 shadow-lg hover:shadow-[0_0_15px_rgba(234,56,76,0.15)] transition-shadow overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
                      {session.icon}
                    </div>
                    <Badge className="bg-sinner-red">{session.price}</Badge>
                  </div>
                  <CardTitle className="mt-3">{session.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-sinner-red mr-1" />
                      <span>{session.duration}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">
                    {session.description}
                  </p>
                  <Button 
                    onClick={() => handleOpenScheduler(session.calendlyPath)}
                    className="w-full bg-sinner-red hover:bg-red-700 text-white group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sinner-red via-red-600 to-sinner-red bg-[length:200%_100%] animate-shimmer opacity-70"></span>
                    <span className="relative flex items-center justify-center">
                      Book Now <Calendar className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20 self-start">
                  What To Expect
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Your Session Journey
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-1.5 bg-sinner-red/10 rounded-full mr-3 mt-0.5">
                      <Users className="h-4 w-4 text-sinner-red" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Personal Attention</h3>
                      <p className="text-gray-400 text-sm">
                        One-on-one focus on your specific needs and goals
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-1.5 bg-sinner-red/10 rounded-full mr-3 mt-0.5">
                      <Dumbbell className="h-4 w-4 text-sinner-red" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Expert Guidance</h3>
                      <p className="text-gray-400 text-sm">
                        Professional coaching from certified trainers
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-1.5 bg-sinner-red/10 rounded-full mr-3 mt-0.5">
                      <Target className="h-4 w-4 text-sinner-red" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Goal Setting</h3>
                      <p className="text-gray-400 text-sm">
                        Define clear objectives and track your progress
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-black rounded-lg border border-zinc-800 flex items-start">
                  <Info className="h-5 w-5 text-sinner-red mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    Please arrive 10 minutes before your scheduled session. Wear comfortable clothing and bring a water bottle.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-zinc-800 to-black p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white mb-4">Quick Availability</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-700">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-sinner-red mr-2" />
                      <span className="text-gray-300">Today</span>
                    </div>
                    <Badge className="bg-sinner-red/20 text-white">3 slots</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-700">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-sinner-red mr-2" />
                      <span className="text-gray-300">Tomorrow</span>
                    </div>
                    <Badge className="bg-sinner-red/20 text-white">5 slots</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-zinc-700">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-sinner-red mr-2" />
                      <span className="text-gray-300">This Week</span>
                    </div>
                    <Badge className="bg-sinner-red/20 text-white">12+ slots</Badge>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setDialogOpen(true)}
                  className="w-full bg-sinner-red hover:bg-red-700 text-white font-medium"
                >
                  View Full Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
            Have Questions?
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Need Help Scheduling?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Our team is here to assist you in finding the perfect time for your training session.
            Reach out with any questions or special requests.
          </p>
          <Button 
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
            onClick={() => window.location.href = '/contact'}
          >
            Contact Us
          </Button>
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[900px] p-0 bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-hidden">
          <DialogHeader className="p-6 border-b border-zinc-800">
            <DialogTitle className="flex items-center text-xl font-bold">
              <Calendar className="h-5 w-5 text-sinner-red mr-2" />
              Schedule Your Session
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a date and time that works best for you
            </DialogDescription>
          </DialogHeader>
          <div className="h-[650px]">
            <CalendlyScheduler 
              url={`https://calendly.com/surrenderedsinnerfitness${selectedSession ? selectedSession : ''}`}
              className="h-full w-full border-0" 
              onEventScheduled={handleEventScheduled}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default Schedule;
