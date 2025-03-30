
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import { CheckCircle, ChevronLeft, CreditCard, Dumbbell, Loader2, Star, Users, Heart, BookOpen, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { subscriptionPlans, subscriptionAddons } from '@/components/payment/SubscriptionData';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceValue?: number;
  currency: string;
  interval: string;
  features: string[];
  category: string;
  popular?: boolean;
  addons?: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
}

const PlansCatalog = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('nutrition');
  const [isLoading, setIsLoading] = useState(false);
  const [catalogPlans, setCatalogPlans] = useState<Plan[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [recommendedPlanId, setRecommendedPlanId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if there's a recommended plan from quiz
    if (location.state && location.state.recommendedPlanId) {
      setRecommendedPlanId(location.state.recommendedPlanId);
      
      // Set active tab based on recommended plan
      const planType = location.state.recommendedPlanId.split('-')[0];
      if (planType === 'nutrition') {
        setActiveTab('nutrition');
      } else if (planType === 'lifting' || planType === 'weight') {
        setActiveTab('training');
      } else if (planType === 'premium') {
        setActiveTab('premium');
      }
    }
  }, [location]);
  
  // Transform subscription data to match the Plan interface
  useEffect(() => {
    const transformedPlans: Plan[] = [];
    
    subscriptionPlans.forEach(plan => {
      const planCategory = plan.id === 'nutrition' ? 'nutrition' : 
                          plan.id === 'lifting' ? 'training' : 
                          plan.id === 'premium' ? 'premium' : 'other';
      
      transformedPlans.push({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.priceValue || 0,
        priceValue: plan.priceValue || 0,
        currency: 'USD',
        interval: 'month',
        features: plan.features,
        category: planCategory,
        popular: plan.id === 'premium',
        addons: plan.addons
      });
    });
    
    setCatalogPlans(transformedPlans);
  }, []);
  
  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  };
  
  const calculateTotalPrice = (plan: Plan) => {
    let total = plan.priceValue || plan.price;
    
    // Add selected addons
    if (plan.addons) {
      plan.addons.forEach(addon => {
        if (selectedAddons[addon.id]) {
          total += addon.price;
        }
      });
    }
    
    return total;
  };
  
  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan",
        variant: "default",
      });
      navigate('/login', { state: { redirectAfterLogin: '/plans-catalog' } });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get selected addons for this plan
      const planAddons = plan.addons || [];
      const selectedPlanAddons = planAddons.filter(addon => selectedAddons[addon.id]);
      
      // Calculate total price including addons
      const totalPrice = calculateTotalPrice(plan);
      
      // Create a checkout session in Stripe
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'create_checkout_session',
          data: {
            planId: plan.id,
            planType: plan.category,
            price: totalPrice,
            planName: plan.name,
            addons: selectedPlanAddons
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Record the checkout attempt in the database
        await supabase.from('payment_history').insert({
          user_id: user?.id,
          amount: totalPrice,
          currency: plan.currency,
          description: `Subscription to ${plan.name}${selectedPlanAddons.length > 0 ? ' with addons' : ''}`,
          status: 'pending',
          payment_method: 'stripe',
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            interval: plan.interval,
            addons: selectedPlanAddons.map(addon => addon.id)
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
  
  const getPlanIcon = (category: string) => {
    switch (category) {
      case 'nutrition':
        return <Heart className="h-5 w-5 text-sinner-red" />;
      case 'training':
        return <Dumbbell className="h-5 w-5 text-sinner-red" />;
      case 'premium':
        return <Star className="h-5 w-5 text-sinner-red" />;
      case 'online':
        return <BookOpen className="h-5 w-5 text-sinner-red" />;
      default:
        return <Target className="h-5 w-5 text-sinner-red" />;
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
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="nutrition" className="text-white data-[state=active]:bg-sinner-red">
                    <Heart className="h-4 w-4 mr-2" />
                    Nutrition
                  </TabsTrigger>
                  <TabsTrigger value="training" className="text-white data-[state=active]:bg-sinner-red">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Training
                  </TabsTrigger>
                  <TabsTrigger value="premium" className="text-white data-[state=active]:bg-sinner-red">
                    <Star className="h-4 w-4 mr-2" />
                    Premium
                  </TabsTrigger>
                </TabsList>
                
                {['nutrition', 'training', 'premium'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {catalogPlans
                        .filter(plan => plan.category === category)
                        .map((plan) => (
                          <Card 
                            key={plan.id} 
                            className={`bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col ${
                              recommendedPlanId && plan.id.includes(recommendedPlanId.split('-')[0]) 
                                ? 'ring-2 ring-sinner-red shadow-[0_0_20px_rgba(234,56,76,0.3)]' 
                                : ''
                            }`}
                          >
                            {plan.popular && (
                              <div className="bg-sinner-red text-white text-xs font-semibold py-1 px-3 absolute right-0 top-4 rounded-l-md">
                                MOST POPULAR
                              </div>
                            )}
                            {recommendedPlanId && plan.id.includes(recommendedPlanId.split('-')[0]) && (
                              <div className="bg-green-600 text-white text-xs font-semibold py-1 px-3 absolute left-0 top-4 rounded-r-md">
                                RECOMMENDED FOR YOU
                              </div>
                            )}
                            <CardHeader className="pb-2">
                              <div className="flex items-center mb-2">
                                {getPlanIcon(plan.category)}
                                <CardTitle className="ml-2">{plan.name}</CardTitle>
                              </div>
                              <CardDescription className="text-gray-400">
                                {plan.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 flex-1">
                              <div className="mb-4">
                                <p className="text-3xl font-bold">${plan.price}</p>
                                <p className="text-sm text-gray-400">per {plan.interval}</p>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-white mb-2">Includes:</h4>
                                  <ul className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                      <li key={index} className="flex text-sm">
                                        <CheckCircle className="h-4 w-4 text-sinner-red mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {plan.addons && plan.addons.length > 0 && (
                                  <div className="pt-4 border-t border-zinc-800">
                                    <h4 className="text-sm font-medium text-white mb-2">Available Add-ons:</h4>
                                    <div className="space-y-2">
                                      {plan.addons.map((addon) => (
                                        <div key={addon.id} className="flex items-start justify-between">
                                          <div className="flex items-start">
                                            <input
                                              type="checkbox"
                                              id={`addon-${plan.id}-${addon.id}`}
                                              checked={!!selectedAddons[addon.id]}
                                              onChange={() => handleAddonToggle(addon.id)}
                                              className="mt-1 mr-2"
                                            />
                                            <div>
                                              <label 
                                                htmlFor={`addon-${plan.id}-${addon.id}`}
                                                className="text-sm font-medium cursor-pointer"
                                              >
                                                {addon.name}
                                              </label>
                                              <p className="text-xs text-gray-400">{addon.description}</p>
                                            </div>
                                          </div>
                                          <span className="text-sm font-medium">+${addon.price}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-zinc-800">
                              <div className="w-full">
                                {Object.keys(selectedAddons).some(key => selectedAddons[key]) && (
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm">Total:</span>
                                    <span className="font-bold">${calculateTotalPrice(plan)}/month</span>
                                  </div>
                                )}
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
                              </div>
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
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
                  <TabsTrigger value="nutrition" className="text-white data-[state=active]:bg-sinner-red">
                    <Heart className="h-4 w-4 mr-2" />
                    Nutrition
                  </TabsTrigger>
                  <TabsTrigger value="training" className="text-white data-[state=active]:bg-sinner-red">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Training
                  </TabsTrigger>
                  <TabsTrigger value="premium" className="text-white data-[state=active]:bg-sinner-red">
                    <Star className="h-4 w-4 mr-2" />
                    Premium
                  </TabsTrigger>
                </TabsList>
                
                {['nutrition', 'training', 'premium'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catalogPlans
                        .filter(plan => plan.category === category)
                        .map((plan) => (
                          <Card key={plan.id} className="bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col">
                            {plan.popular && (
                              <div className="bg-sinner-red text-white text-xs font-semibold py-1 px-3 absolute right-0 top-4 rounded-l-md">
                                MOST POPULAR
                              </div>
                            )}
                            <CardHeader className="pb-2">
                              <div className="flex items-center mb-2">
                                {getPlanIcon(plan.category)}
                                <CardTitle className="ml-2">{plan.name}</CardTitle>
                              </div>
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
