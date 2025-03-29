
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, Video, MapPin, Clock, ExternalLink, Info, User, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  registrationUrl?: string;
  isFree?: boolean;
}

const Events = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Transform database data to match the Event interface
          const formattedEvents = data.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description || '',
            date: new Date(event.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            time: event.time || '',
            location: event.location || '',
            imageUrl: event.image_url || '/placeholder.svg',
            isOnline: event.is_online || false,
            price: Number(event.price) || 0,
            spots: event.spots || 0,
            spotsRemaining: event.spots_remaining || 0,
            registrationUrl: event.registration_url || '#',
            isFree: Number(event.price) <= 0
          }));
          
          setEvents(formattedEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [toast]);
  
  const handleRegister = async (event: Event) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to register for events.',
        variant: 'default',
      });
      navigate('/login', { state: { redirectAfterLogin: '/events' } });
      return;
    }
    
    if (event.spotsRemaining <= 0) {
      toast({
        title: 'Event Full',
        description: 'Sorry, this event is already at full capacity.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (event.isFree) {
        // Handle free event registration directly
        toast({
          title: 'Registration Successful',
          description: `You're now registered for ${event.title}!`,
          variant: 'default',
        });
        // Here you would typically record the registration in the database
      } else {
        // For paid events, redirect to payment processor
        navigate('/payment-process', { 
          state: { 
            type: 'event',
            eventId: event.id,
            amount: event.price.toFixed(2),
            title: event.title
          } 
        });
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: 'Registration Failed',
        description: 'There was a problem registering for this event. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const filteredEvents = activeTab === 'all' 
    ? events 
    : activeTab === 'online' 
      ? events.filter(event => event.isOnline) 
      : events.filter(event => !event.isOnline);
      
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SEO 
        title="Events & Clinics | Surrendered Sinner Fitness"
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
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onRegister={() => handleRegister(event)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-[#333]">
                  <Calendar className="h-16 w-16 text-[#ea384c]/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Events Currently Scheduled</h3>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    We're currently planning our next round of events. 
                    Check back soon for upcoming workshops and training clinics!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="inperson" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onRegister={() => handleRegister(event)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-[#333]">
                  <MapPin className="h-16 w-16 text-[#ea384c]/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No In-Person Events Currently Scheduled</h3>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    We're currently planning our next in-person training clinics. 
                    Check back soon for updates!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="online" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onRegister={() => handleRegister(event)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-[#333]">
                  <Video className="h-16 w-16 text-[#ea384c]/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Online Workshops Currently Scheduled</h3>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    We're currently planning our next online workshops. 
                    Check back soon for upcoming virtual training sessions!
                  </p>
                </div>
              )}
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
                <Button className="bg-[#ea384c] hover:bg-[#c8313f]" onClick={() => navigate('/contact')}>Contact Us</Button>
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

interface EventCardProps {
  event: Event;
  onRegister: () => void;
}

const EventCard = ({ event, onRegister }: EventCardProps) => {
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
        <div className="text-lg font-bold">
          {event.isFree ? 'Free' : `$${event.price.toFixed(2)}`}
        </div>
        <Button 
          className="bg-[#ea384c] hover:bg-[#c8313f]"
          onClick={onRegister}
          disabled={event.spotsRemaining <= 0}
        >
          {event.spotsRemaining <= 0 ? 'Sold Out' : 'Register'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Events;
