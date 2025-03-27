
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import { CheckCircle, ChevronLeft, CreditCard, Dumbbell, Loader2, Star, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  category: string;
  popular?: boolean;
}

const PlansCatalog = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<Plan[]>([]);
  
  // Placeholder plan data - in a real app, this would come from Stripe via the edge function
  useEffect(() => {
    const plans: Plan[] = [
      {
        id: 'price_monthly_personal',
        name: 'Personal Training',
        description: 'One-on-one coaching for optimal results',
        price: 149.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Weekly 1-on-1 sessions',
          'Personalized workout plan',
          'Nutrition guidance',
          'Progress tracking',
          'Email support'
        ],
        category: 'personal',
        popular: true
      },
      {
        id: 'price_quarterly_personal',
        name: 'Personal Quarterly',
        description: 'Save with quarterly commitment',
        price: 399.99,
        currency: 'USD',
        interval: 'quarter',
        features: [
          'All Personal Training features',
          'Priority scheduling',
          'Bi-weekly check-ins',
          '15% savings vs monthly',
          'Nutrition plan included'
        ],
        category: 'personal'
      },
      {
        id: 'price_monthly_group',
        name: 'Group Training',
        description: 'Train with a community of like-minded individuals',
        price: 79.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited group classes',
          'Community support',
          'Basic workout templates',
          'Monthly fitness assessments',
          'App access'
        ],
        category: 'group'
      },
      {
        id: 'price_quarterly_group',
        name: 'Group Quarterly',
        description: 'Group training with quarterly savings',
        price: 199.99,
        currency: 'USD',
        interval: 'quarter',
        features: [
          'All Group Training features',
          'One personal session per month',
          'Basic nutrition guide',
          '15% savings vs monthly',
          'Community challenges'
        ],
        category: 'group',
        popular: true
      },
      {
        id: 'price_monthly_competition',
        name: 'Competition Prep',
        description: 'Specialized coaching for competitions',
        price: 299.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Contest-specific training',
          'Posing practice',
          'Customized nutrition plan',
          'Weekly check-ins',
          'Competition day coaching'
        ],
        category: 'competition'
      },
      {
        id: 'price_monthly_online',
        name: 'Online Coaching',
        description: 'Remote coaching with professional guidance',
        price: 99.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Custom workout program',
          'Video form checks',
          'Nutrition recommendations',
          'Email/text support',
          'Monthly program updates'
        ],
        category: 'online',
        popular: true
      }
    ];
    
    setSubscriptionPlans(plans);
    
    // In a real implementation, you would fetch plans from Stripe
    // This is here for future reference:
    /*
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { 
            action: 'get-subscription-plans'
          }
        });
        
        if (error) throw error;
        setSubscriptionPlans(data.plans || []);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlans();
    */
  }, []);
  
  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan",
        variant: "default",
      });
      navigate('/login');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a checkout session in Stripe
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'create-checkout-session',
          params: {
            priceId: plan.id,
            mode: 'subscription',
            userId: user?.id,
            userEmail: user?.email,
            successUrl: `${window.location.origin}/payment-success?plan=${encodeURIComponent(plan.name)}`,
            cancelUrl: `${window.location.origin}/plans-catalog`
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Record the checkout attempt in the database
        await supabase.from('payment_history').insert({
          user_id: user?.id,
          amount: plan.price * 100, // Convert to cents for Stripe
          currency: plan.currency,
          description: `Subscription to ${plan.name}`,
          status: 'pending',
          payment_method: 'stripe',
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            interval: plan.interval
          }
        });
        
        // Redirect to Stripe's checkout page
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SEO 
        title="Subscription Plans | Surrendered Sinner Fitness"
        description="Browse and subscribe to our premium fitness training plans."
        canonical="https://surrenderedsinnerfitness.com/plans-catalog"
      />
      
      {isAuthenticated ? (
        <div className="flex min-h-screen">
          <DashboardNav />
          <div className="flex-1 md:ml-64">
            <div className="p-6">
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  className="mb-4"
                  onClick={() => navigate('/dashboard')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold">Training Plans Catalog</h1>
                <p className="text-gray-400 mt-2">
                  Browse our selection of premium training plans and subscriptions
                </p>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="personal" className="text-white data-[state=active]:bg-sinner-red">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="group" className="text-white data-[state=active]:bg-sinner-red">
                    <Users className="h-4 w-4 mr-2" />
                    Group
                  </TabsTrigger>
                  <TabsTrigger value="competition" className="text-white data-[state=active]:bg-sinner-red">
                    <Star className="h-4 w-4 mr-2" />
                    Competition
                  </TabsTrigger>
                  <TabsTrigger value="online" className="text-white data-[state=active]:bg-sinner-red">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Online
                  </TabsTrigger>
                </TabsList>
                
                {['personal', 'group', 'competition', 'online'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subscriptionPlans
                        .filter(plan => plan.category === category)
                        .map((plan) => (
                          <Card key={plan.id} className="bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col">
                            {plan.popular && (
                              <div className="bg-sinner-red text-white text-xs font-semibold py-1 px-3 absolute right-0 top-4 rounded-l-md">
                                MOST POPULAR
                              </div>
                            )}
                            <CardHeader className="pb-2">
                              <CardTitle>{plan.name}</CardTitle>
                              <CardDescription className="text-gray-400">
                                {plan.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 flex-1">
                              <div className="mb-4">
                                <p className="text-3xl font-bold">${plan.price}</p>
                                <p className="text-sm text-gray-400">per {plan.interval}</p>
                              </div>
                              <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex text-sm">
                                    <CheckCircle className="h-4 w-4 text-sinner-red mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                            <CardFooter>
                              <Button 
                                className="w-full bg-sinner-red hover:bg-red-700"
                                onClick={() => handleSubscribe(plan)}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>Subscribe</>
                                )}
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          <div className="flex-1">
            <div className="relative min-h-[300px] bg-gradient-to-b from-black to-zinc-900 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,56,76,0.15),transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(234,56,76,0.1),transparent_70%)]"></div>
              
              <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-black border border-sinner-red/30 shadow-[0_0_15px_rgba(234,56,76,0.3)]">
                  <Dumbbell className="h-8 w-8 text-sinner-red" />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
                  Training Plans Catalog
                </h1>
                
                <p className="text-center text-gray-300 max-w-2xl mb-8">
                  Browse our selection of premium training plans and subscriptions. 
                  Log in to subscribe and start your fitness journey.
                </p>
                
                <Button 
                  className="bg-sinner-red hover:bg-red-700"
                  onClick={() => navigate('/login')}
                >
                  Log In to Subscribe
                </Button>
              </div>
            </div>
            
            <div className="container mx-auto py-16 px-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
                  <TabsTrigger value="personal" className="text-white data-[state=active]:bg-sinner-red">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="group" className="text-white data-[state=active]:bg-sinner-red">
                    <Users className="h-4 w-4 mr-2" />
                    Group
                  </TabsTrigger>
                  <TabsTrigger value="competition" className="text-white data-[state=active]:bg-sinner-red">
                    <Star className="h-4 w-4 mr-2" />
                    Competition
                  </TabsTrigger>
                  <TabsTrigger value="online" className="text-white data-[state=active]:bg-sinner-red">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Online
                  </TabsTrigger>
                </TabsList>
                
                {['personal', 'group', 'competition', 'online'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subscriptionPlans
                        .filter(plan => plan.category === category)
                        .map((plan) => (
                          <Card key={plan.id} className="bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col">
                            {plan.popular && (
                              <div className="bg-sinner-red text-white text-xs font-semibold py-1 px-3 absolute right-0 top-4 rounded-l-md">
                                MOST POPULAR
                              </div>
                            )}
                            <CardHeader className="pb-2">
                              <CardTitle>{plan.name}</CardTitle>
                              <CardDescription className="text-gray-400">
                                {plan.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 flex-1">
                              <div className="mb-4">
                                <p className="text-3xl font-bold">${plan.price}</p>
                                <p className="text-sm text-gray-400">per {plan.interval}</p>
                              </div>
                              <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex text-sm">
                                    <CheckCircle className="h-4 w-4 text-sinner-red mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                            <CardFooter>
                              <Button 
                                className="w-full bg-sinner-red hover:bg-red-700"
                                onClick={() => navigate('/login')}
                              >
                                Login to Subscribe
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            
            <Footer />
          </div>
        </>
      )}
    </div>
  );
};

export default PlansCatalog;
