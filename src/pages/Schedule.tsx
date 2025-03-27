
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import DashboardNav from '@/components/dashboard/DashboardNav';

const Schedule = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classes');
  
  // Sample class schedule data
  const classSchedule = [
    { id: 1, name: "Strength Training", day: "Monday", time: "6:00 AM - 7:00 AM", trainer: "John Doe", spots: 8 },
    { id: 2, name: "HIIT Workout", day: "Monday", time: "5:30 PM - 6:30 PM", trainer: "Jane Smith", spots: 5 },
    { id: 3, name: "Powerlifting", day: "Tuesday", time: "7:00 AM - 8:30 AM", trainer: "Mike Johnson", spots: 6 },
    { id: 4, name: "Bodybuilding", day: "Tuesday", time: "6:00 PM - 7:30 PM", trainer: "Sarah Williams", spots: 4 },
    { id: 5, name: "CrossFit", day: "Wednesday", time: "6:00 AM - 7:00 AM", trainer: "Chris Taylor", spots: 10 },
    { id: 6, name: "Core & Mobility", day: "Wednesday", time: "12:00 PM - 1:00 PM", trainer: "Lisa Brown", spots: 12 },
    { id: 7, name: "Strength Training", day: "Thursday", time: "6:00 AM - 7:00 AM", trainer: "John Doe", spots: 8 },
    { id: 8, name: "HIIT Workout", day: "Thursday", time: "5:30 PM - 6:30 PM", trainer: "Jane Smith", spots: 5 },
    { id: 9, name: "Olympic Lifting", day: "Friday", time: "7:00 AM - 8:30 AM", trainer: "Mike Johnson", spots: 6 },
    { id: 10, name: "Open Gym", day: "Friday", time: "4:00 PM - 8:00 PM", trainer: "Various", spots: 20 },
    { id: 11, name: "Weekend Warrior", day: "Saturday", time: "9:00 AM - 10:30 AM", trainer: "Sarah Williams", spots: 15 },
    { id: 12, name: "Strength & Conditioning", day: "Saturday", time: "11:00 AM - 12:30 PM", trainer: "Chris Taylor", spots: 10 },
  ];
  
  // Sample events data
  const upcomingEvents = [
    { 
      id: 1, 
      title: "Summer Strength Challenge", 
      date: "July 15, 2023", 
      time: "10:00 AM - 2:00 PM", 
      location: "Main Gym Floor",
      description: "Join us for our annual summer strength challenge. Test your strength across multiple events and compete for prizes!",
      image: "summer-challenge.jpg" 
    },
    { 
      id: 2, 
      title: "Nutrition Workshop", 
      date: "July 25, 2023", 
      time: "6:30 PM - 8:00 PM", 
      location: "Community Room",
      description: "Learn the fundamentals of nutrition for muscle gain and fat loss from our certified nutritionists.",
      image: "nutrition-workshop.jpg" 
    },
    { 
      id: 3, 
      title: "Powerlifting Seminar", 
      date: "August 5, 2023", 
      time: "9:00 AM - 12:00 PM", 
      location: "Strength Zone",
      description: "Perfect your squat, bench, and deadlift technique with our experienced powerlifting coaches.",
      image: "powerlifting-seminar.jpg" 
    },
  ];
  
  // Filter classes by day
  const getClassesByDay = (day) => {
    return classSchedule.filter(classItem => classItem.day === day);
  };
  
  const renderClassTable = (day) => {
    const classes = getClassesByDay(day);
    
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle>{day}</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead>Class</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Spots</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.id} className="border-zinc-800">
                    <TableCell className="font-medium">{classItem.name}</TableCell>
                    <TableCell>{classItem.time}</TableCell>
                    <TableCell>{classItem.trainer}</TableCell>
                    <TableCell>{classItem.spots} available</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(isAuthenticated ? '/dashboard/schedule' : '/login')}
                      >
                        Book
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-400 py-4 text-center">No classes scheduled for {day}</p>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Class Schedule | Surrendered Sinner Fitness"
        description="View our weekly class schedule and sign up for fitness classes at Surrendered Sinner Fitness."
        canonical="https://surrenderedsinnerfitness.com/schedule"
      />
      
      {isAuthenticated ? (
        <div className="flex min-h-screen">
          <DashboardNav />
          <div className="flex-1 md:ml-64">
            <div className="container mx-auto py-8 px-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Class Schedule</h1>
                <p className="text-gray-400">
                  Browse and book our weekly classes and upcoming events
                </p>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="classes" className="data-[state=active]:bg-sinner-red">
                    <Calendar className="h-4 w-4 mr-2" />
                    Classes
                  </TabsTrigger>
                  <TabsTrigger value="events" className="data-[state=active]:bg-sinner-red">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Events
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="classes" className="space-y-6">
                  {renderClassTable("Monday")}
                  {renderClassTable("Tuesday")}
                  {renderClassTable("Wednesday")}
                  {renderClassTable("Thursday")}
                  {renderClassTable("Friday")}
                  {renderClassTable("Saturday")}
                </TabsContent>
                
                <TabsContent value="events" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event) => (
                      <Card key={event.id} className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription className="flex flex-col space-y-1 mt-2">
                            <div className="flex items-center text-gray-400">
                              <CalendarIcon className="h-4 w-4 mr-2 text-sinner-red" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Clock className="h-4 w-4 mr-2 text-sinner-red" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                              <MapPin className="h-4 w-4 mr-2 text-sinner-red" />
                              <span>{event.location}</span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300">{event.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          <div className="flex-1">
            {/* Hero Section */}
            <div className="relative min-h-[400px] bg-gradient-to-b from-black to-zinc-900 flex items-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
              
              <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Class Schedule</h1>
                  <p className="text-xl md:text-2xl text-gray-300 mb-8">
                    Find the perfect class to fit your schedule and training goals.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      className="bg-sinner-red hover:bg-red-700"
                      onClick={() => navigate('/login')}
                    >
                      Book a Class
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-sinner-red text-sinner-red hover:bg-sinner-red/10"
                      onClick={() => navigate('/login')}
                    >
                      Join Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Schedule Section */}
            <div className="py-16 bg-black">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
                    Weekly Schedule
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Class</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Browse our weekly schedule and find the perfect class for your fitness goals
                  </p>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                    <TabsTrigger value="classes" className="data-[state=active]:bg-sinner-red">
                      <Calendar className="h-4 w-4 mr-2" />
                      Classes
                    </TabsTrigger>
                    <TabsTrigger value="events" className="data-[state=active]:bg-sinner-red">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Events
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="classes" className="space-y-8">
                    {renderClassTable("Monday")}
                    {renderClassTable("Tuesday")}
                    {renderClassTable("Wednesday")}
                    {renderClassTable("Thursday")}
                    {renderClassTable("Friday")}
                    {renderClassTable("Saturday")}
                  </TabsContent>
                  
                  <TabsContent value="events" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingEvents.map((event) => (
                        <Card key={event.id} className="bg-zinc-900 border-zinc-800">
                          <CardHeader>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription className="flex flex-col space-y-1 mt-2">
                              <div className="flex items-center text-gray-400">
                                <CalendarIcon className="h-4 w-4 mr-2 text-sinner-red" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Clock className="h-4 w-4 mr-2 text-sinner-red" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <MapPin className="h-4 w-4 mr-2 text-sinner-red" />
                                <span>{event.location}</span>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300">{event.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="py-16 bg-zinc-900">
              <div className="container mx-auto px-4 text-center">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join a Class?</h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Sign up today to reserve your spot in our premium fitness classes.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button 
                      className="bg-sinner-red hover:bg-red-700"
                      onClick={() => navigate('/login')}
                    >
                      Sign Up
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-sinner-red text-sinner-red hover:bg-sinner-red/10"
                      onClick={() => navigate('/plans')}
                    >
                      View Plans
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="py-16 bg-black">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-sinner-red mb-2">20+</p>
                    <p className="text-gray-300 text-lg">Weekly Classes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-sinner-red mb-2">10</p>
                    <p className="text-gray-300 text-lg">Professional Trainers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-sinner-red mb-2">500+</p>
                    <p className="text-gray-300 text-lg">Active Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-sinner-red mb-2">98%</p>
                    <p className="text-gray-300 text-lg">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section-divider">
              <Separator className="bg-sinner-red/20 h-0.5" />
            </div>
            
            <Footer />
          </div>
        </>
      )}
    </div>
  );
};

export default Schedule;
