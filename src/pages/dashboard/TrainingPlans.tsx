
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Clock, Plus, Check, AlertTriangle, ShoppingCart, Loader2, ClipboardList, CheckCircle, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { withErrorHandling } from '@/utils/databaseErrorHandler';
import TrainingPlanQuiz from '@/components/plans/TrainingPlanQuiz';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string | null;
  plan_type: string;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  payment_id?: string | null;
  is_purchased?: boolean;
}

interface CustomPlanResult {
  id: string;
  selected_plan_name: string;
  selected_plan_price: number;
  plan_features: string[];
  quiz_answers: Record<string, string>;
  created_at: string;
}

const TrainingPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomPlanResult[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const { profile, isAuthenticated, isLoading, isInitialized } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchWorkoutPlans();
      fetchCustomPlanResults();
    }
  }, [isAuthenticated, profile]);

  const fetchWorkoutPlans = async () => {
    if (!profile?.id) return;

    try {
      setIsLoadingPlans(true);
      
      const { data, error } = await withErrorHandling(
        () => supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
        'Failed to load workout plans'
      );
        
      if (error) throw error;
      
      // Mark purchased plans
      const purchasedPlans = data?.map(plan => ({
        ...plan,
        is_purchased: true
      })) || [];
      
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
        () => supabase
          .from('custom_plan_results')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
        'Failed to load custom plan results'
      );
        
      if (error) throw error;
      
      // Filter out plans that are already purchased
      const existingPlanIds = plans.map(p => p.custom_plan_result_id);
      const filteredPlans = (data || []).filter(
        plan => !existingPlanIds.includes(plan.id)
      );
      
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
  
  const purchasePlan = async (planId: string, planName: string, planPrice: number) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase plans",
        variant: "destructive"
      });
      return;
    }
    
    setPurchasingPlan(planId);
    
    try {
      // Add the payment record first
      const { data: paymentData, error: paymentError } = await withErrorHandling(
        () => supabase
          .from('payments')
          .insert([{
            user_id: profile.id,
            amount: planPrice * 100, // Store in cents
            status: 'completed',
            payment_method: 'credit_card',
            metadata: { plan_id: planId, plan_name: planName }
          }])
          .select('id')
          .single(),
        'Failed to record payment'
      );
      
      if (paymentError) throw paymentError;
      
      if (!paymentData?.id) {
        throw new Error("Payment record creation failed");
      }
      
      // Now add plan to workout_plans with the payment_id
      const { error: workoutError } = await withErrorHandling(
        () => supabase
          .rpc('add_custom_plan_to_workout_plans', {
            p_user_id: profile.id,
            p_custom_plan_result_id: planId
          }),
        'Failed to add plan to your account'
      );
      
      if (workoutError) throw workoutError;
      
      // Update the newly created workout plan with payment_id
      const { error: updateError } = await withErrorHandling(
        () => supabase
          .from('workout_plans')
          .update({ payment_id: paymentData.id })
          .eq('custom_plan_result_id', planId)
          .eq('user_id', profile.id),
        'Failed to update payment information'
      );
      
      if (updateError) throw updateError;
      
      toast({
        title: "Plan Purchased",
        description: `${planName} has been added to your plans.`,
      });
      
      // Refresh plans
      fetchWorkoutPlans();
      fetchCustomPlanResults();
    } catch (error: any) {
      console.error("Error purchasing plan:", error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase plan",
        variant: "destructive"
      });
    } finally {
      setPurchasingPlan(null);
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
                      <Button 
                        variant="default"
                        className="w-full bg-[#ea384c] hover:bg-red-700"
                        onClick={() => purchasePlan(
                          plan.id, 
                          plan.selected_plan_name, 
                          plan.selected_plan_price
                        )}
                        disabled={purchasingPlan === plan.id}
                      >
                        {purchasingPlan === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Purchase Plan
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {plans.length === 0 && customPlans.length === 0 && (
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
    </div>
  );
};

export default TrainingPlans;
