
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Download, Activity, ClipboardList, CheckCircle, ShoppingCart } from "lucide-react";
import TrainingPlanQuiz from "@/components/plans/TrainingPlanQuiz";
import { Badge } from "@/components/ui/badge";

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  pdf_url: string | null;
  plan_type: string;
  created_at: string;
  is_purchased?: boolean;
  price?: number;
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
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomPlanResult[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { state: { redirectAfterLogin: '/dashboard/plans' } });
      return;
    }
    
    if (isAuthenticated && profile) {
      fetchWorkoutPlans();
      fetchCustomPlanResults();
    }
    
    // Check URL params for showing quiz
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('showQuiz') === 'true') {
      setShowQuiz(true);
      // Clean URL
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [isAuthenticated, isLoading, profile, isInitialized, location]);
  
  const fetchWorkoutPlans = async () => {
    try {
      setIsLoadingPlans(true);
      
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });
        
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
      const { data, error } = await supabase
        .from('custom_plan_results')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Filter out plans that are already purchased
      const filteredPlans = data || [];
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
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find custom plan result
      const planResult = customPlans.find(plan => plan.id === planId);
      
      if (!planResult) {
        throw new Error("Plan not found");
      }
      
      // Add plan to workout_plans
      const { error: workoutError } = await supabase
        .rpc('add_custom_plan_to_workout_plans', {
          p_user_id: profile.id,
          p_custom_plan_result_id: planId
        });
      
      if (workoutError) throw workoutError;
      
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
  
  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A1F2C] text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Training Plans</h1>
              <p className="text-gray-400 mt-1">View and manage your personalized workout routines</p>
            </div>
            
            <Button 
              onClick={() => setShowQuiz(true)}
              className="mt-4 md:mt-0 bg-sinner-red hover:bg-red-700"
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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                      <Card key={plan.id} className="bg-gray-900 border-gray-800">
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
                        <CardFooter className="border-t border-gray-800 pt-4 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-gray-300"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          
                          {plan.pdf_url ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-[#9b87f5] hover:bg-[#8a76e4]"
                              onClick={() => window.open(plan.pdf_url!, '_blank')}
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
                    <ShoppingCart className="h-5 w-5 text-sinner-red mr-2" />
                    <h2 className="text-xl font-semibold">Available Custom Plans</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customPlans.map((plan) => (
                      <Card key={plan.id} className="bg-gray-900 border-gray-800">
                        <CardHeader className="pb-2">
                          <div className="flex items-center mb-2">
                            <span className="text-sm text-gray-400">
                              Based on your quiz results
                            </span>
                          </div>
                          <CardTitle>{plan.selected_plan_name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            Created on {new Date(plan.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="text-xl font-bold text-sinner-red">
                              ${plan.selected_plan_price}
                              <span className="text-sm text-green-400 ml-2">5% quiz discount</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {plan.plan_features?.map((feature, index) => (
                              <div key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-300">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-800 pt-4">
                          <Button 
                            variant="default"
                            className="w-full bg-sinner-red hover:bg-red-700"
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
                <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800 p-8">
                  <ClipboardList className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Training Plans Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                    Take our fitness assessment quiz to get a personalized training plan 
                    designed for your goals, fitness level, and preferences.
                  </p>
                  <Button 
                    onClick={() => setShowQuiz(true)}
                    className="bg-sinner-red hover:bg-red-700"
                  >
                    Take the Quiz
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlans;
