
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import SEO from '@/components/SEO';
import { Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useAuth } from '@/hooks/useAuth';

const Schedule = () => {
  const { isAuthenticated } = useAuth();
  const [scheduleItems] = useState([
    {
      id: 1,
      day: 'Monday',
      time: '6:00 AM - 8:00 AM',
      location: 'Downtown Studio',
      type: 'Group Training',
      available: true,
    },
    {
      id: 2,
      day: 'Monday',
      time: '9:00 AM - 11:00 AM',
      location: 'Eastside Gym',
      type: 'Personal Training',
      available: true,
    },
    {
      id: 3, 
      day: 'Tuesday',
      time: '7:00 AM - 9:00 AM',
      location: 'Downtown Studio',
      type: 'HIIT Session',
      available: false,
    },
    {
      id: 4,
      day: 'Wednesday',
      time: '5:00 PM - 7:00 PM',
      location: 'Westside Location',
      type: 'Strength Training',
      available: true,
    },
    {
      id: 5,
      day: 'Thursday',
      time: '8:00 AM - 10:00 AM',
      location: 'Downtown Studio',
      type: 'Personal Training',
      available: true,
    },
    {
      id: 6,
      day: 'Friday',
      time: '6:00 PM - 8:00 PM',
      location: 'Eastside Gym',
      type: 'Group Training',
      available: true,
    },
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Schedule | Surrendered Sinner Fitness"
        description="View and book available training sessions with Surrendered Sinner Fitness."
        canonical="https://surrenderedsinnerfitness.com/schedule"
      />
      
      {isAuthenticated ? (
        <div className="flex min-h-screen">
          <DashboardNav />
          <div className="flex-1 md:ml-64">
            <div className="container mx-auto py-8 px-4">
              <ScheduleContent scheduleItems={scheduleItems} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          <div className="flex-1">
            <HeroSection />
            <div className="container mx-auto py-16 px-4">
              <ScheduleContent scheduleItems={scheduleItems} />
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

const HeroSection = () => (
  <div className="relative min-h-[300px] bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
    
    <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-black border border-sinner-red/30 shadow-[0_0_15px_rgba(234,56,76,0.3)]">
        <Calendar className="h-8 w-8 text-sinner-red" />
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
        Training Schedule
      </h1>
      
      <p className="text-center text-gray-300 max-w-2xl mb-8">
        Book your next training session with us. Check available time slots and locations.
      </p>
      
      <div className="flex flex-wrap justify-center gap-6 mt-4">
        <div className="flex items-center space-x-2 text-gray-300">
          <CheckCircle className="h-5 w-5 text-sinner-red" />
          <span>Expert Coaching</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <CheckCircle className="h-5 w-5 text-sinner-red" />
          <span>Convenient Locations</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <CheckCircle className="h-5 w-5 text-sinner-red" />
          <span>Flexible Scheduling</span>
        </div>
      </div>
    </div>
  </div>
);

const ScheduleContent = ({ scheduleItems }) => (
  <>
    <div className="text-center mb-10">
      <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
        Available Sessions
      </Badge>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Find Your Perfect Training Time
      </h2>
      <p className="text-gray-400 max-w-2xl mx-auto">
        Choose from our various training sessions throughout the week. 
        Book your slot today to secure your place.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {scheduleItems.map((item) => (
        <Card key={item.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4">
              <Badge variant={item.available ? "default" : "secondary"} className={item.available ? "bg-sinner-red text-white" : "bg-zinc-700 text-zinc-300"}>
                {item.available ? "Available" : "Booked"}
              </Badge>
              <h3 className="text-xl font-bold text-white mt-2">{item.day}</h3>
              <div className="flex items-center text-gray-400 mt-1">
                <Clock className="h-4 w-4 mr-2" />
                <span>{item.time}</span>
              </div>
              <div className="flex items-center text-gray-400 mt-1">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{item.location}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white font-medium">{item.type}</div>
                <Button
                  variant={item.available ? "default" : "outline"}
                  size="sm"
                  disabled={!item.available}
                  className={item.available ? "bg-sinner-red hover:bg-red-700" : "text-gray-500 border-gray-700"}
                >
                  {item.available ? "Book Now" : "Booked"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    <div className="text-center">
      <p className="text-gray-400 mb-4">Don't see a time that works for you?</p>
      <Button className="bg-sinner-red hover:bg-red-700">
        Request Custom Time
      </Button>
    </div>
  </>
);

export default Schedule;
