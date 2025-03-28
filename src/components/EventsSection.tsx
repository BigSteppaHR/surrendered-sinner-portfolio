
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Video, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

const EventsSection = ({ featured = false }: { featured?: boolean }) => {
  const navigate = useNavigate();
  
  // Example events data - in production would come from your database
  const events = [
    {
      id: 'e1',
      title: 'Summer Bodybuilding Workshop',
      description: 'Learn advanced posing and competition prep techniques in this hands-on workshop',
      date: 'July 15, 2023',
      time: '10:00 AM - 2:00 PM',
      location: 'Gold\'s Gym, Los Angeles',
      type: 'in-person',
      price: '$89',
      spots: 15,
      spotsLeft: 7,
      image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5'
    },
    {
      id: 'e2',
      title: 'Nutrition Masterclass',
      description: 'Dive deep into macronutrient timing, supplementation, and contest prep nutrition',
      date: 'August 5, 2023',
      time: '6:00 PM - 8:00 PM',
      location: 'Zoom Webinar',
      type: 'online',
      price: '$45',
      spots: 50,
      spotsLeft: 23,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061'
    },
    {
      id: 'e3',
      title: 'Strength Training Fundamentals',
      description: 'Master proper form and technique for all major compound lifts',
      date: 'August 20, 2023',
      time: '9:00 AM - 12:00 PM',
      location: 'Alpha Fitness Center, Miami',
      type: 'in-person',
      price: '$75',
      spots: 20,
      spotsLeft: 12,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
    },
    {
      id: 'e4',
      title: 'Competition Prep Q&A',
      description: 'Live Q&A session with professional bodybuilders and coaches',
      date: 'September 10, 2023',
      time: '7:00 PM - 8:30 PM',
      location: 'Zoom Webinar',
      type: 'online',
      price: '$25',
      spots: 100,
      spotsLeft: 86,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
    }
  ];

  // If featured is true, only show 3 events, otherwise show all
  const displayEvents = featured ? events.slice(0, 3) : events;

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <section className="py-12 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Upcoming <span className="text-[#ea384c]">Events & Clinics</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Join us for in-person and online training events to elevate your fitness journey with expert guidance and community support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayEvents.map((event) => (
            <Card key={event.id} className="bg-zinc-900 border-[#333] overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={`${event.image}/&auto=format&fit=crop&w=600&q=80`} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
                <Badge className="absolute top-4 right-4 bg-black/70 text-white border-0">
                  {event.type === 'in-person' ? 'In Person' : 'Online'}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
                  <span className="text-[#ea384c] font-bold">{event.price}</span>
                </div>
                <CardDescription className="text-gray-400 flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-2 text-[#ea384c]" />
                  {event.date} • {event.time}
                </CardDescription>
                <CardDescription className="text-gray-400 flex items-center mt-1">
                  {event.type === 'in-person' ? (
                    <MapPin className="h-4 w-4 mr-2 text-[#ea384c]" />
                  ) : (
                    <Video className="h-4 w-4 mr-2 text-[#ea384c]" />
                  )}
                  {event.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">{event.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.spotsLeft} spots left of {event.spots}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleEventClick(event.id)}
                  className="w-full bg-[#ea384c] hover:bg-[#c42e3e]"
                >
                  Register Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {featured && (
          <div className="text-center mt-10">
            <Button 
              onClick={() => navigate('/events')}
              variant="outline" 
              className="border-[#ea384c] text-[#ea384c] hover:bg-[#ea384c]/10"
            >
              View All Events
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
