
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ChevronRight, Dumbbell, Users, Star, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import DashboardNav from '@/components/dashboard/DashboardNav';

const Plans = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const renderPlanCard = (
    title: string, 
    price: string, 
    description: string, 
    features: string[], 
    popular: boolean = false,
    priceId: string = ""
  ) => (
    <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
      {popular && (
        <div className="absolute top-0 right-0">
          <Badge className="m-2 bg-sinner-red">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-3xl font-bold">{price}</p>
          <p className="text-sm text-gray-400">per month</p>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-sinner-red mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-sinner-red hover:bg-red-700"
          onClick={() => navigate('/plans-catalog')}
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Training Plans | Surrendered Sinner Fitness"
        description="Explore our range of personalized fitness training plans to achieve your goals."
        canonical="https://surrenderedsinnerfitness.com/plans"
      />
      
      {isAuthenticated ? (
        <div className="flex min-h-screen">
          <DashboardNav />
          <div className="flex-1 md:ml-64">
            <div className="container mx-auto py-8 px-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Training Plans</h1>
                <p className="text-gray-400">
                  Explore our range of personalized training plans to achieve your fitness goals
                </p>
              </div>
              
              <div className="mb-8">
                <Button 
                  className="bg-sinner-red hover:bg-red-700"
                  onClick={() => navigate('/plans-catalog')}
                >
                  Browse Full Catalog
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="personal" className="data-[state=active]:bg-sinner-red">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="group" className="data-[state=active]:bg-sinner-red">
                    <Users className="h-4 w-4 mr-2" />
                    Group
                  </TabsTrigger>
                  <TabsTrigger value="special" className="data-[state=active]:bg-sinner-red">
                    <Star className="h-4 w-4 mr-2" />
                    Special
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderPlanCard(
                      "Essential", 
                      "$149.99", 
                      "Perfect for beginners looking for guidance",
                      [
                        "Custom workout program",
                        "Basic nutrition guidance",
                        "Bi-weekly check-ins",
                        "Email support",
                        "Basic progress tracking"
                      ]
                    )}
                    
                    {renderPlanCard(
                      "Advanced", 
                      "$249.99", 
                      "Take your training to the next level",
                      [
                        "All Essential plan features",
                        "Personalized nutrition plan",
                        "Weekly check-ins",
                        "Form checks via video",
                        "Direct text messaging support",
                        "Detailed progress tracking"
                      ],
                      true,
                      "price_monthly_advanced"
                    )}
                    
                    {renderPlanCard(
                      "Elite", 
                      "$399.99", 
                      "Comprehensive coaching for maximum results",
                      [
                        "All Advanced plan features",
                        "Unlimited check-ins",
                        "Priority coaching access",
                        "Custom supplementation guide",
                        "Recovery protocols",
                        "Advanced physical assessments",
                        "24/7 coach access"
                      ]
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="group" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderPlanCard(
                      "Group Basic", 
                      "$79.99", 
                      "Train with others for motivation and support",
                      [
                        "2 group sessions per week",
                        "Group workout programs",
                        "Community support",
                        "Monthly assessments",
                        "Group nutrition seminars"
                      ]
                    )}
                    
                    {renderPlanCard(
                      "Group Plus", 
                      "$129.99", 
                      "Enhanced group training experience",
                      [
                        "Unlimited group sessions",
                        "Custom workout template",
                        "Group and individual feedback",
                        "Bi-weekly assessments",
                        "Nutrition guidance",
                        "Community challenges"
                      ],
                      true
                    )}
                    
                    {renderPlanCard(
                      "Group Elite", 
                      "$199.99", 
                      "The ultimate group training package",
                      [
                        "All Group Plus features",
                        "2 personal training sessions/month",
                        "Premium nutrition support",
                        "Advanced workout customization",
                        "Priority scheduling",
                        "Monthly body composition analysis"
                      ]
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="special" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderPlanCard(
                      "Competition Prep", 
                      "$349.99", 
                      "Specialized coaching for bodybuilding competitions",
                      [
                        "Contest-specific training",
                        "Precise nutrition programming",
                        "Weekly check-ins",
                        "Peak week protocols",
                        "Posing practice",
                        "Competition day guidance"
                      ],
                      true
                    )}
                    
                    {renderPlanCard(
                      "Rehab & Recovery", 
                      "$199.99", 
                      "Specialized training for injury recovery",
                      [
                        "Rehabilitation-focused workouts",
                        "Corrective exercise programming",
                        "Weekly progress monitoring",
                        "Coordination with healthcare providers",
                        "Gradual progression planning",
                        "Pain management strategies"
                      ]
                    )}
                    
                    {renderPlanCard(
                      "Sport-Specific", 
                      "$299.99", 
                      "Training tailored to your sport's demands",
                      [
                        "Sport-specific performance training",
                        "Position-specific exercises",
                        "Periodized programming",
                        "Performance testing",
                        "Speed and agility work",
                        "Recovery optimization",
                        "Seasonal planning"
                      ]
                    )}
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
            <div className="relative min-h-[500px] bg-gradient-to-b from-black to-zinc-900 flex items-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
              
              <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Training Plans</h1>
                  <p className="text-xl md:text-2xl text-gray-300 mb-8">
                    Transform your fitness journey with our professional training plans tailored to your goals.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      className="bg-sinner-red hover:bg-red-700"
                      onClick={() => navigate('/plans-catalog')}
                    >
                      Browse Full Catalog
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-sinner-red text-sinner-red hover:bg-sinner-red/10"
                      onClick={() => navigate('/payment')}
                    >
                      View Pricing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Plans Section */}
            <div className="py-16 bg-black">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
                    Training Plans
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Path</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Select from our range of professional training plans designed to meet your specific goals and fitness level.
                  </p>
                </div>
                
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
                    <TabsTrigger value="personal" className="data-[state=active]:bg-sinner-red">
                      <Dumbbell className="h-4 w-4 mr-2" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="group" className="data-[state=active]:bg-sinner-red">
                      <Users className="h-4 w-4 mr-2" />
                      Group
                    </TabsTrigger>
                    <TabsTrigger value="special" className="data-[state=active]:bg-sinner-red">
                      <Star className="h-4 w-4 mr-2" />
                      Special
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {renderPlanCard(
                        "Essential", 
                        "$149.99", 
                        "Perfect for beginners looking for guidance",
                        [
                          "Custom workout program",
                          "Basic nutrition guidance",
                          "Bi-weekly check-ins",
                          "Email support",
                          "Basic progress tracking"
                        ]
                      )}
                      
                      {renderPlanCard(
                        "Advanced", 
                        "$249.99", 
                        "Take your training to the next level",
                        [
                          "All Essential plan features",
                          "Personalized nutrition plan",
                          "Weekly check-ins",
                          "Form checks via video",
                          "Direct text messaging support",
                          "Detailed progress tracking"
                        ],
                        true
                      )}
                      
                      {renderPlanCard(
                        "Elite", 
                        "$399.99", 
                        "Comprehensive coaching for maximum results",
                        [
                          "All Advanced plan features",
                          "Unlimited check-ins",
                          "Priority coaching access",
                          "Custom supplementation guide",
                          "Recovery protocols",
                          "Advanced physical assessments",
                          "24/7 coach access"
                        ]
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="group" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {renderPlanCard(
                        "Group Basic", 
                        "$79.99", 
                        "Train with others for motivation and support",
                        [
                          "2 group sessions per week",
                          "Group workout programs",
                          "Community support",
                          "Monthly assessments",
                          "Group nutrition seminars"
                        ]
                      )}
                      
                      {renderPlanCard(
                        "Group Plus", 
                        "$129.99", 
                        "Enhanced group training experience",
                        [
                          "Unlimited group sessions",
                          "Custom workout template",
                          "Group and individual feedback",
                          "Bi-weekly assessments",
                          "Nutrition guidance",
                          "Community challenges"
                        ],
                        true
                      )}
                      
                      {renderPlanCard(
                        "Group Elite", 
                        "$199.99", 
                        "The ultimate group training package",
                        [
                          "All Group Plus features",
                          "2 personal training sessions/month",
                          "Premium nutrition support",
                          "Advanced workout customization",
                          "Priority scheduling",
                          "Monthly body composition analysis"
                        ]
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="special" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {renderPlanCard(
                        "Competition Prep", 
                        "$349.99", 
                        "Specialized coaching for bodybuilding competitions",
                        [
                          "Contest-specific training",
                          "Precise nutrition programming",
                          "Weekly check-ins",
                          "Peak week protocols",
                          "Posing practice",
                          "Competition day guidance"
                        ],
                        true
                      )}
                      
                      {renderPlanCard(
                        "Rehab & Recovery", 
                        "$199.99", 
                        "Specialized training for injury recovery",
                        [
                          "Rehabilitation-focused workouts",
                          "Corrective exercise programming",
                          "Weekly progress monitoring",
                          "Coordination with healthcare providers",
                          "Gradual progression planning",
                          "Pain management strategies"
                        ]
                      )}
                      
                      {renderPlanCard(
                        "Sport-Specific", 
                        "$299.99", 
                        "Training tailored to your sport's demands",
                        [
                          "Sport-specific performance training",
                          "Position-specific exercises",
                          "Periodized programming",
                          "Performance testing",
                          "Speed and agility work",
                          "Recovery optimization",
                          "Seasonal planning"
                        ]
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Features Section */}
            <div className="py-16 bg-zinc-900">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <Badge className="mb-2 bg-sinner-red/10 text-sinner-red border-sinner-red/20">
                    Our Approach
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Training Plans</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Our training plans are designed with scientific principles and years of practical experience
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-sinner-red/20 flex items-center justify-center mb-4">
                        <Dumbbell className="h-6 w-6 text-sinner-red" />
                      </div>
                      <CardTitle>Personalized Approach</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">
                        Each plan is tailored to your specific goals, fitness level, and personal preferences to maximize your results.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-sinner-red/20 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-sinner-red" />
                      </div>
                      <CardTitle>Expert Coaches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">
                        Our team consists of certified coaches with extensive experience in various fitness disciplines.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-sinner-red/20 flex items-center justify-center mb-4">
                        <Star className="h-6 w-6 text-sinner-red" />
                      </div>
                      <CardTitle>Proven Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">
                        Our methodology has helped thousands of clients achieve their fitness goals and transform their lives.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-sinner-red/20 flex items-center justify-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-sinner-red" />
                      </div>
                      <CardTitle>Holistic Approach</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">
                        We address all aspects of fitness including training, nutrition, recovery, and mindset for complete results.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-sinner-red/20 flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 text-sinner-red" />
                      </div>
                      <CardTitle>Ongoing Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">
                        Regular check-ins, adjustments, and ongoing guidance ensure you're always on the right track.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-sinner-red/20 flex items-center justify-center mb-4">
                        <Dumbbell className="h-6 w-6 text-sinner-red" />
                      </div>
                      <CardTitle>Flexible Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">
                        Choose from various coaching styles and commitment levels to find the perfect fit for your lifestyle.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center mt-12">
                  <Button 
                    className="bg-sinner-red hover:bg-red-700"
                    onClick={() => navigate('/plans-catalog')}
                  >
                    Browse Full Catalog
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="py-16 bg-black">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Fitness Journey?</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join our community today and take the first step towards a stronger, healthier you.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    className="bg-sinner-red hover:bg-red-700"
                    onClick={() => navigate('/signup')}
                  >
                    Join Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-sinner-red text-sinner-red hover:bg-sinner-red/10"
                    onClick={() => navigate('/plans-catalog')}
                  >
                    Explore Plans
                  </Button>
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

export default Plans;
