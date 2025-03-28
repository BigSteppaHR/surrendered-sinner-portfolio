
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, Video, MapPin, Clock, ExternalLink, Info, User } from 'lucide-react';
import SEO from '@/components/SEO';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  isOnline: boolean;
  price: number;
  spots: number;
  spotsRemaining: number;
  registrationUrl: string;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Advanced Bodybuilding Techniques',
    description: 'Learn specialized bodybuilding techniques to push past plateaus and maximize hypertrophy. This in-person clinic will cover advanced training methods, intensity techniques, and programming strategies.',
    date: 'June 15, 2023',
    time: '10:00 AM - 1:00 PM',
    location: 'Alpha Fitness Center, Los Angeles',
    imageUrl: '/placeholder.svg',
    isOnline: false,
    price: 99,
    spots: 15,
    spotsRemaining: 8,
    registrationUrl: '#'
  },
  {
    id: '2',
    title: 'Nutrition Planning Workshop',
    description: 'Online zoom session covering the fundamentals of nutrition planning for muscle building and fat loss. Learn how to calculate macros, meal timing, and supplement strategies for optimal results.',
    date: 'June 22, 2023',
    time: '6:00 PM - 8:00 PM',
    location: 'Zoom Virtual Meeting',
    imageUrl: '/placeholder.svg',
    isOnline: true,
    price: 49,
    spots: 30,
    spotsRemaining: 15,
    registrationUrl: '#'
  },
  {
    id: '3',
    title: 'Strength Programming Fundamentals',
    description: 'Learn how to build effective strength training programs for yourself or your clients. This workshop covers periodization, exercise selection, and program design principles.',
    date: 'July 5, 2023',
    time: '11:00 AM - 2:00 PM',
    location: 'Performance Lab, San Diego',
    imageUrl: '/placeholder.svg',
    isOnline: false,
    price: 129,
    spots: 12,
    spotsRemaining: 4,
    registrationUrl: '#'
  },
  {
    id: '4',
    title: 'Contest Prep Masterclass',
    description: 'Online session for competitors and coaches looking to optimize their contest preparation strategies. Covers nutrition, training, posing, and peak week protocols.',
    date: 'July 12, 2023',
    time: '5:00 PM - 7:30 PM',
    location: 'Zoom Virtual Meeting',
    imageUrl: '/placeholder.svg',
    isOnline: true,
    price: 79,
    spots: 25,
    spotsRemaining: 18,
    registrationUrl: '#'
  }
];

const Events = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredEvents = activeTab === 'all' 
    ? upcomingEvents 
    : activeTab === 'online' 
      ? upcomingEvents.filter(event => event.isOnline) 
      : upcomingEvents.filter(event => !event.isOnline);
      
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SEO 
        title="Events & Clinics | Alpha Nutrition & Fitness"
        description="Join our in-person clinics and online workshops to enhance your fitness knowledge and skills."
      />
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upcoming <span className="text-[#ea384c]">Events</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join our in-person clinics and online workshops to take your training and nutrition knowledge to the next level
            </p>
          </div>
          
          <Tabs defaultValue="all" className="mb-8">
            <div className="flex justify-center">
              <TabsList className="bg-zinc-900 border border-[#333]">
                <TabsTrigger 
                  value="all"
                  onClick={() => setActiveTab('all')}
                  className="data-[state=active]:bg-[#ea384c] data-[state=active]:text-white"
                >
                  All Events
                </TabsTrigger>
                <TabsTrigger 
                  value="inperson"
                  onClick={() => setActiveTab('inperson')}
                  className="data-[state=active]:bg-[#ea384c] data-[state=active]:text-white"
                >
                  In-Person Clinics
                </TabsTrigger>
                <TabsTrigger 
                  value="online"
                  onClick={() => setActiveTab('online')}
                  className="data-[state=active]:bg-[#ea384c] data-[state=active]:text-white"
                >
                  Online Workshops
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="inperson" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="online" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-12 p-6 bg-zinc-900 rounded-lg border border-[#333]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-full bg-[#ea384c]/20 border border-[#ea384c]/40">
                <Info className="h-10 w-10 text-[#ea384c]" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Request a Custom Event</h3>
                <p className="text-gray-400">
                  Looking for specialized training on specific topics? We can organize custom workshops or clinics for teams, 
                  gyms, or groups. Contact us to discuss your needs and we'll create a tailored event.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Button className="bg-[#ea384c] hover:bg-[#c8313f]">Contact Us</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Separator className="bg-[#333]" />
      <Footer />
    </div>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card className="bg-zinc-900 border-[#333] overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            event.isOnline 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            {event.isOnline ? 'Online' : 'In Person'}
          </span>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="text-gray-400 flex items-center gap-1">
          <Calendar className="h-4 w-4" /> {event.date}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-300 mb-4">{event.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-400">
            {event.isOnline ? (
              <Video className="h-4 w-4 mr-2" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-400">
            <User className="h-4 w-4 mr-2" />
            <span>{event.spotsRemaining} of {event.spots} spots remaining</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t border-[#333] pt-4">
        <div className="text-lg font-bold">${event.price}</div>
        <Button className="bg-[#ea384c] hover:bg-[#c8313f]" asChild>
          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            Register <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Events;
