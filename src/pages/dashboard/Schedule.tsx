
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CalendlyScheduler from '@/components/CalendlyScheduler';
import { ArrowLeft, CalendarDays, CheckCircle, Clock, MapPin, Info, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DashboardNav from "@/components/dashboard/DashboardNav";

const Schedule = () => {
  const navigate = useNavigate();
  const [isScheduled, setIsScheduled] = useState(false);
  
  // Function to handle scheduling completion
  const handleScheduleSuccess = () => {
    setIsScheduled(true);
    
    // Here we would typically save the session information to the database
    // This would be implemented with a Supabase call
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-4 p-2 hover:bg-sinner-red/10"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Schedule a Session</h1>
                <p className="text-gray-400 mt-1">Book a training session with one of our coaches</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isScheduled ? (
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden shadow-xl">
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-sinner-red/10 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-sinner-red" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Session Scheduled Successfully!</h2>
                      <p className="text-gray-400 mb-6 max-w-md">
                        Your training session has been booked. You'll receive a confirmation email shortly.
                      </p>
                      <div className="bg-black/50 border border-zinc-800 p-4 rounded-lg mb-6 max-w-sm w-full">
                        <div className="flex space-x-4">
                          <div className="min-w-fit">
                            <div className="w-14 h-14 bg-zinc-800 rounded-lg flex flex-col items-center justify-center border border-zinc-700">
                              <span className="text-xs text-gray-400">Oct</span>
                              <span className="text-xl font-bold">15</span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center space-y-1">
                            <h3 className="font-medium">Strength Training Session</h3>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>10:00 AM</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              <span>Main Gym Facility</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          className="border-zinc-700 hover:bg-zinc-800"
                          onClick={() => setIsScheduled(false)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Another
                        </Button>
                        <Button
                          className="bg-sinner-red hover:bg-red-700"
                          onClick={() => navigate("/dashboard")}
                        >
                          View All Sessions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarDays className="h-5 w-5 text-sinner-red mr-2" />
                      Select Date & Time
                    </CardTitle>
                    <CardDescription>Choose a convenient time for your training session</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CalendlyScheduler 
                      url="https://calendly.com/surrenderedsinnerfitness" 
                      className="h-[650px] w-full border-t border-zinc-800" 
                      onEventScheduled={handleScheduleSuccess}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
              <Card className="bg-zinc-900 border-zinc-800 mb-6 sticky top-6 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 text-sinner-red mr-2" />
                    Session Information
                  </CardTitle>
                  <CardDescription>What to expect from your training session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Available Session Types:</h3>
                    <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                      <h4 className="font-medium mb-1">Strength Training</h4>
                      <p className="text-sm text-gray-400">Focus on building muscle strength and power through resistance training.</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                      <h4 className="font-medium mb-1">Cardio Conditioning</h4>
                      <p className="text-sm text-gray-400">Improve cardiovascular health and endurance through targeted exercises.</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                      <h4 className="font-medium mb-1">HIIT Session</h4>
                      <p className="text-sm text-gray-400">High-intensity interval training for maximum calorie burn and fitness gains.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Preparation Tips:</h3>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li className="flex">
                        <span className="text-sinner-red mr-2">•</span>
                        <span>Wear comfortable athletic clothing</span>
                      </li>
                      <li className="flex">
                        <span className="text-sinner-red mr-2">•</span>
                        <span>Bring a water bottle to stay hydrated</span>
                      </li>
                      <li className="flex">
                        <span className="text-sinner-red mr-2">•</span>
                        <span>Arrive 10 minutes before your session</span>
                      </li>
                      <li className="flex">
                        <span className="text-sinner-red mr-2">•</span>
                        <span>Eat a light meal 1-2 hours beforehand</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-white">Cancellation Policy:</h3>
                    <p className="text-sm text-gray-400">
                      Please provide at least 24 hours notice for cancellations. Late cancellations may be subject to a fee.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
