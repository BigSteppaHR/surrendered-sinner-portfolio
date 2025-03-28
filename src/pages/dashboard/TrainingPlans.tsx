
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Clock, Plus, Check, AlertTriangle, ShoppingCart, Loader2, ClipboardList, CheckCircle, Activity, X, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { withErrorHandling } from '@/utils/databaseErrorHandler';
import TrainingPlanQuiz from '@/components/plans/TrainingPlanQuiz';
import { WorkoutPlan } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomPlanResult {
  id: string;
  selected_plan_name: string;
  selected_plan_price: number;
  plan_features: string[];
  quiz_answers: Record<string, string>;
  created_at: string;
}

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  billing_interval: string;
  stripe_price_id: string | null;
}

const TrainingPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomPlanResult[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPackage[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const { profile, isAuthenticated, isLoading, isInitialized } = useAuth();
  const { toast } = useToast();
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPackage | null>(null);
  const [selectedQuizResult, setSelectedQuizResult] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [activeUserSubscriptions, setActiveUserSubscriptions] = useState<Record<string, boolean>>({});

  // Stripe elements setup
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Convert features string to array if needed
      const formattedPlans = data.map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? JSON.parse(plan.features) 
          : plan.features
      }));
      
      setSubscriptionPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchUserSubscriptions = async () => {
    if (!profile?.id) return;
    
    try {
      // Check active subscriptions with Stripe
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: {
          action: 'checkSubscriptionStatus',
          params: {
            user_id: profile.id
          }
        }
      });
      
      if (error) throw error;
      
      console.log("User subscription status:", data);
      
      // Update local state with subscription info
      if (data) {
        setUserSubscriptions(data.subscriptions || []);
        
        // Create a map of subscription_id -> active status
        const activeMap: Record<string, boolean> = {};
        if (data.activeSubscriptions) {
          data.activeSubscriptions.forEach((sub: any) => {
            if (sub.subscription_id) {
              activeMap[sub.subscription_id] = true;
            }
          });
        }
        setActiveUserSubscriptions(activeMap);
      }
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchWorkoutPlans();
      fetchCustomPlanResults();
      fetchSubscriptionPlans();
      fetchUserSubscriptions();
    }
  }, [isAuthenticated, profile, fetchSubscriptionPlans]);

  const fetchWorkoutPlans = async () => {
    if (!profile?.id) return;

    try {
      setIsLoadingPlans(true);
      
      const { data, error } = await withErrorHandling(
        async () => {
          return await supabase
            .from('workout_plans')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });
        },
        'Failed to load workout plans'
      );
        
      if (error) throw error;
      
      // Make sure data is typed correctly and handle null case
      const purchasedPlans = data ? data.map(plan => ({
        ...plan,
        is_purchased: true
      })) : [];
      
      setPlans(purchasedPlans);
    } catch (error: any) {
      console.error("Error fetching workout plans:", error);
      toast({
        title: "Error",
        description: "Failed to load workout plans",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };
  
  const fetchCustomPlanResults = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await withErrorHandling(
        async () => {
          return await supabase
            .from('custom_plan_results')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });
        },
        'Failed to load custom plan results'
      );
        
      if (error) throw error;
      
      // Filter out plans that are already purchased
      // Add proper type check and null handling
      const existingPlanIds = plans.map(p => p.custom_plan_result_id || '');
      const filteredPlans = data ? data.filter(
        plan => !existingPlanIds.includes(plan.id)
      ) : [];
      
      setCustomPlans(filteredPlans);
    } catch (error: any) {
      console.error("Error fetching custom plan results:", error);
    }
  };
  
  const handleQuizComplete = () => {
    setShowQuiz(false);
    fetchWorkoutPlans();
    fetchCustomPlanResults();
  };
  
  const initializeCheckout = (plan: SubscriptionPackage, quizResultId: string | null = null) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase plans",
        variant: "destructive"
      });
      return;
    }
    
    // Set email from profile if available
    if (profile.email) {
      setEmail(profile.email);
    }
    if (profile.full_name) {
      setName(profile.full_name);
    }
    
    setSelectedPlan(plan);
    setSelectedQuizResult(quizResultId);
    setShowCheckoutDialog(true);
  };
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !selectedPlan || !profile?.id) {
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card element not found");
      return;
    }
    
    if (!name || !email) {
      setPaymentError("Name and email are required");
      return;
    }
    
    setCheckoutLoading(true);
    setPaymentError(null);
    
    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name,
          email
        }
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }
      
      // Call our edge function to create subscription
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: {
          action: 'createSubscription',
          params: {
            email,
            name, 
            payment_method_id: paymentMethod.id,
            price_id: selectedPlan.stripe_price_id || 'price_not_set', // This should be set in the Stripe dashboard
            subscription_id: selectedPlan.id,
            user_id: profile.id,
            quiz_result_id: selectedQuizResult
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.status === 'active') {
        // Subscription is active immediately
        toast({
          title: "Subscription Active",
          description: `Your ${selectedPlan.name} subscription is now active.`,
        });
        
        // Update local state
        fetchUserSubscriptions();
        fetchWorkoutPlans();
        
        // Close dialog
        setShowCheckoutDialog(false);
      } else if (data.clientSecret) {
        // Needs additional confirmation
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
        
        toast({
          title: "Subscription Created",
          description: `Your ${selectedPlan.name} subscription has been set up successfully.`,
        });
        
        // Update local state
        fetchUserSubscriptions();
        fetchWorkoutPlans();
        
        // Close dialog
        setShowCheckoutDialog(false);
      } else {
        throw new Error("Unknown response from server");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      setPaymentError(error.message || "Failed to set up subscription");
      
      toast({
        title: "Subscription Failed",
        description: error.message || "There was an error setting up your subscription.",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  const getPlanTypeIcon = (planType: string) => {
    switch (planType) {
      case 'weight_loss':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'muscle_building':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'competition':
        return <Activity className="h-5 w-5 text-purple-500" />;
      default:
        return <ClipboardList className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getPlanTypeLabel = (planType: string) => {
    switch (planType) {
      case 'weight_loss':
        return 'Weight Loss';
      case 'muscle_building':
        return 'Muscle Building';
      case 'competition':
        return 'Competition Prep';
      default:
        return 'Custom Plan';
    }
  };
  
  const handleDownload = async (plan: WorkoutPlan) => {
    if (!plan.pdf_url) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "This plan doesn't have a PDF available yet."
      });
      return;
    }

    try {
      // Open the PDF in a new tab
      window.open(plan.pdf_url, '_blank');
      
      toast({
        title: "Download initiated",
        description: "Your training plan PDF is being downloaded."
      });
    } catch (error) {
      console.error('Error downloading plan:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was a problem downloading your plan."
      });
    }
  };
  
  const formatBillingInterval = (interval: string) => {
    switch (interval) {
      case 'month': return 'Monthly';
      case 'quarter': return 'Quarterly';
      case 'year': return 'Yearly';
      default: return interval;
    }
  };
  
  const isPlanActive = (planId: string) => {
    return !!activeUserSubscriptions[planId];
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Training Plans</h1>
          <p className="text-gray-400 mt-1">View and manage your personalized workout routines</p>
        </div>
        
        <Button 
          onClick={() => setShowQuiz(true)}
          className="mt-4 md:mt-0 bg-[#ea384c] hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Get Custom Plan
        </Button>
      </div>
      
      {showQuiz ? (
        <div className="py-4 mb-8">
          <TrainingPlanQuiz onComplete={handleQuizComplete} />
        </div>
      ) : null}
      
      {isLoadingPlans ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#ea384c]" />
        </div>
      ) : (
        <>
          {/* Subscription Plans Section */}
          {subscriptionPlans.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <CreditCard className="h-5 w-5 text-[#ea384c] mr-2" />
                <h2 className="text-xl font-semibold">Training Subscriptions</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className={`bg-zinc-900 border-zinc-800 ${isPlanActive(plan.id) ? 'ring-2 ring-green-500/40' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="capitalize text-xs bg-[#ea384c]/20 text-[#ea384c] border-[#ea384c]/40">
                          {formatBillingInterval(plan.billing_interval)}
                        </Badge>
                        
                        {isPlanActive(plan.id) && (
                          <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-600">
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-xl font-bold text-[#ea384c]">
                          ${plan.price.toFixed(2)}
                          <span className="text-sm text-gray-400 ml-2">
                            /{plan.billing_interval}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {plan.features?.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-800 pt-4">
                      {isPlanActive(plan.id) ? (
                        <Button variant="outline" className="w-full border-green-600/30 text-green-400" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Active Subscription
                        </Button>
                      ) : (
                        <Button 
                          variant="default"
                          className="w-full bg-[#ea384c] hover:bg-red-700"
                          onClick={() => initializeCheckout(plan)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Purchased Plans Section */}
          {plans.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">Your Purchased Plans</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getPlanTypeIcon(plan.plan_type)}
                          <span className="text-sm text-gray-400 ml-2">
                            {getPlanTypeLabel(plan.plan_type)}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-600">
                          Purchased
                        </Badge>
                      </div>
                      <CardTitle>{plan.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Created on {new Date(plan.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300 whitespace-pre-line">
                        {plan.description || "No description available."}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-800 pt-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-gray-300 border-zinc-700"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {plan.pdf_url ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-[#ea384c] hover:bg-red-700"
                          onClick={() => handleDownload(plan)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled
                        >
                          PDF Pending
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Available Custom Plans Section */}
          {customPlans.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <ShoppingCart className="h-5 w-5 text-[#ea384c] mr-2" />
                <h2 className="text-xl font-semibold">Available Custom Plans</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customPlans.map((plan) => (
                  <Card key={plan.id} className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-400">
                          Based on your quiz results
                        </span>
                      </div>
                      <CardTitle>{plan.selected_plan_name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Created on {format(new Date(plan.created_at), 'MMMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-xl font-bold text-[#ea384c]">
                          ${plan.selected_plan_price}
                          <span className="text-sm text-green-400 ml-2">5% quiz discount</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {plan.plan_features?.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-800 pt-4">
                      {/* Find matching subscription plan */}
                      {subscriptionPlans.length > 0 && (
                        <Button 
                          variant="default"
                          className="w-full bg-[#ea384c] hover:bg-red-700"
                          onClick={() => {
                            // Find matching plan based on price/name
                            const matchingPlan = subscriptionPlans.find(p => 
                              p.name.includes(plan.selected_plan_name) || 
                              plan.selected_plan_name.includes(p.name)
                            ) || subscriptionPlans[0];
                            
                            initializeCheckout(matchingPlan, plan.id);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Subscribe to Plan
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {plans.length === 0 && customPlans.length === 0 && subscriptionPlans.length === 0 && (
            <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800 p-8">
              <ClipboardList className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Training Plans Yet</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Take our fitness assessment quiz to get a personalized training plan 
                designed for your goals, fitness level, and preferences.
              </p>
              <Button 
                onClick={() => setShowQuiz(true)}
                className="bg-[#ea384c] hover:bg-red-700"
              >
                Take the Quiz
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              You'll be charged ${selectedPlan?.price.toFixed(2)} per {selectedPlan?.billing_interval}.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-element">Card Details</Label>
              <div className="p-3 border rounded-md bg-zinc-800 border-zinc-700">
                <CardElement id="card-element" />
              </div>
            </div>
            
            {paymentError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{paymentError}</p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckoutDialog(false)}
                disabled={checkoutLoading}
                className="border-zinc-700 text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={!stripe || checkoutLoading}
                className="bg-[#ea384c] hover:bg-red-700"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Subscribe (${selectedPlan?.price.toFixed(2)} / {selectedPlan?.billing_interval})
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingPlans;
