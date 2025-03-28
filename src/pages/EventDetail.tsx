
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Video, Users, Clock, DollarSign, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';

// Mock event data - in production this would come from your database
const events = [
  {
    id: 'e1',
    title: 'Summer Bodybuilding Workshop',
    description: 'Learn advanced posing and competition prep techniques in this hands-on workshop led by experienced competitive bodybuilders. This intensive session covers essential aspects of stage presentation, peak week strategies, and competition day protocols that can make the difference between placing and winning.',
    date: 'July 15, 2023',
    time: '10:00 AM - 2:00 PM',
    location: 'Gold\'s Gym, Los Angeles',
    address: '1234 Muscle Beach Blvd, Los Angeles, CA 90210',
    type: 'in-person',
    price: '$89',
    priceAmount: 89,
    spots: 15,
    spotsLeft: 7,
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5',
    host: 'Brad Johnson',
    details: [
      'Bring workout clothes and posing trunks/suit',
      'Light refreshments provided',
      'Participants receive a digital posing guide',
      'Video recording of your posing for review'
    ]
  },
  {
    id: 'e2',
    title: 'Nutrition Masterclass',
    description: 'Dive deep into macronutrient timing, supplementation, and contest prep nutrition in this comprehensive online masterclass. Learn how to optimize your diet for maximum muscle growth, fat loss, and performance enhancement with evidence-based strategies.',
    date: 'August 5, 2023',
    time: '6:00 PM - 8:00 PM',
    location: 'Zoom Webinar',
    type: 'online',
    price: '$45',
    priceAmount: 45,
    spots: 50,
    spotsLeft: 23,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    host: 'Brad Johnson & Alex Martinez',
    details: [
      'Session will be recorded for participants',
      'Interactive Q&A session included',
      'Comprehensive nutrition guide provided',
      'Personalized macro calculator access'
    ]
  },
  {
    id: 'e3',
    title: 'Strength Training Fundamentals',
    description: 'Master proper form and technique for all major compound lifts in this comprehensive workshop. This hands-on session focuses on squat, bench press, deadlift, and overhead press mechanics with personalized form correction from certified strength coaches.',
    date: 'August 20, 2023',
    time: '9:00 AM - 12:00 PM',
    location: 'Alpha Fitness Center, Miami',
    address: '567 Iron Drive, Miami, FL 33101',
    type: 'in-person',
    price: '$75',
    priceAmount: 75,
    spots: 20,
    spotsLeft: 12,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    host: 'Brad Johnson',
    details: [
      'Suitable for all experience levels',
      'Wear comfortable workout attire',
      'Bring a notebook for training notes',
      'Includes a fundamentals e-book'
    ]
  },
  {
    id: 'e4',
    title: 'Competition Prep Q&A',
    description: 'Live Q&A session with professional bodybuilders and coaches covering all aspects of competition preparation. Get your specific questions answered by athletes who have successfully competed at the highest levels of the sport.',
    date: 'September 10, 2023',
    time: '7:00 PM - 8:30 PM',
    location: 'Zoom Webinar',
    type: 'online',
    price: '$25',
    priceAmount: 25,
    spots: 100,
    spotsLeft: 86,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
    host: 'Brad Johnson & Guest Pro Athletes',
    details: [
      'Submit questions in advance',
      'Session will be recorded',
      'Includes competition checklist PDF',
      'Access to private Facebook group'
    ]
  }
];

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Find the event by ID
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/events')}>View All Events</Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectAfterLogin: `/events/${eventId}` } });
      return;
    }
    
    setIsRegistering(true);
    
    // Here you would call your Stripe integration to handle payment
    // For this example, we'll just simulate a successful registration
    setTimeout(() => {
      navigate('/dashboard', { 
        state: { 
          registration: {
            success: true,
            eventId: event.id,
            eventTitle: event.title
          }
        }
      });
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <SEO 
        title={`${event.title} | Surrendered Sinner Fitness Events`}
        description={event.description.substring(0, 160)}
        canonical={`https://surrenderedsinnerfitness.com/events/${eventId}`}
      />
      
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section with image */}
        <div className="relative h-[300px] md:h-[400px]">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <img 
            src={`${event.image}/&auto=format&fit=crop&w=1920&q=80`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="container mx-auto px-4 absolute inset-0 z-20 flex flex-col justify-center">
            <Badge className="mb-4 bg-[#ea384c] border-0 self-start">
              {event.type === 'in-person' ? 'In-Person Event' : 'Online Webinar'}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-[#ea384c]" />
                {event.date}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-[#ea384c]" />
                {event.time}
              </div>
              <div className="flex items-center">
                {event.type === 'in-person' ? (
                  <MapPin className="h-4 w-4 mr-2 text-[#ea384c]" />
                ) : (
                  <Video className="h-4 w-4 mr-2 text-[#ea384c]" />
                )}
                {event.location}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <p className="text-gray-300 mb-8">{event.description}</p>
              
              <h3 className="text-xl font-bold mb-3">What to Expect</h3>
              <ul className="list-none space-y-2 mb-8">
                {event.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <Info className="h-5 w-5 mr-3 text-[#ea384c] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{detail}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-bold mb-3">Hosted By</h3>
              <p className="text-gray-300 mb-8">{event.host}</p>
              
              {event.type === 'in-person' && event.address && (
                <>
                  <h3 className="text-xl font-bold mb-3">Location</h3>
                  <p className="text-gray-300 mb-2">{event.location}</p>
                  <p className="text-gray-300 mb-8">{event.address}</p>
                </>
              )}
            </div>
            
            <div>
              <Card className="bg-zinc-900 border-[#333] sticky top-4">
                <CardHeader>
                  <CardTitle>Registration</CardTitle>
                  <CardDescription>Secure your spot for this event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span className="text-2xl font-bold text-[#ea384c]">{event.price}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Availability</span>
                    <span className="text-white">{event.spotsLeft} of {event.spots} spots left</span>
                  </div>
                  
                  <Separator className="bg-zinc-800 my-4" />
                  
                  <div className="bg-zinc-800/50 p-4 rounded-md">
                    <div className="flex items-center text-sm mb-2">
                      <DollarSign className="h-4 w-4 mr-2 text-[#ea384c]" />
                      <span className="text-gray-300">Secure payment processing</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-[#ea384c]" />
                      <span className="text-gray-300">Limited spots available</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full bg-[#ea384c] hover:bg-[#c42e3e]"
                  >
                    {isRegistering ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Register Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              onClick={() => navigate('/events')}
              variant="outline" 
              className="border-[#ea384c] text-[#ea384c] hover:bg-[#ea384c]/10"
            >
              Back to All Events
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventDetail;
