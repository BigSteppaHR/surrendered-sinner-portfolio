
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Download, Activity, ClipboardList, DollarSign } from "lucide-react";
import TrainingPlanQuiz from "@/components/plans/TrainingPlanQuiz";

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  pdf_url: string | null;
  plan_type: string;
  created_at: string;
  custom_plan_result_id?: string;
  custom_plan_price?: number;
}

interface CustomPlanResult {
  id: string;
  selected_plan_price: number;
  selected_plan_name: string;
  plan_features: string[];
}

const TrainingPlans = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [customPlanData, setCustomPlanData] = useState<Record<string, CustomPlanResult>>({});
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { redirectAfterLogin: location.pathname } });
      return;
    }
    
    if (isAuthenticated && profile) {
      fetchWorkoutPlans();
      
      // Check for restored quiz state from login redirect
      const pendingAnswers = sessionStorage.getItem('dashboardPendingQuizAnswers');
      if (pendingAnswers) {
        setShowQuiz(true);
        sessionStorage.removeItem('dashboardPendingQuizAnswers');
        sessionStorage.removeItem('dashboardPendingQuizStep');
      }
    }
  }, [isAuthenticated, isLoading, profile, isInitialized]);
  
  const fetchWorkoutPlans = async () => {
    try {
      setIsLoadingPlans(true);
      
      // Get workout plans
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPlans(data || []);
      
      // For plans with custom_plan_result_id, fetch the pricing details
      const customPlanIds = data
        ?.filter(plan => plan.custom_plan_result_id)
        .map(plan => plan.custom_plan_result_id) || [];
      
      if (customPlanIds.length > 0) {
        const { data: customPlans, error: customError } = await supabase
          .from('custom_plan_results')
          .select('id, selected_plan_price, selected_plan_name, plan_features')
          .in('id', customPlanIds);
          
        if (!customError && customPlans) {
          const planMap: Record<string, CustomPlanResult> = {};
          customPlans.forEach(plan => {
            planMap[plan.id] = plan;
          });
          setCustomPlanData(planMap);
        }
      }
      
      // Show quiz if no plans exist
      if (data && data.length === 0) {
        setShowQuiz(true);
      }
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
  
  const handleQuizComplete = () => {
    setShowQuiz(false);
    fetchWorkoutPlans();
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
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Training Plans</h1>
            <p className="text-gray-400 mt-1">View and manage your personalized workout routines</p>
          </div>
          
          {isLoadingPlans ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showQuiz ? (
            <div className="py-4">
              <div className="mb-6 text-center max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold mb-2">No Training Plans Yet</h2>
                <p className="text-gray-400">
                  Take our quick quiz to help us understand your fitness goals and preferences. 
                  We'll use this information to create a personalized training plan for you.
                </p>
              </div>
              
              <TrainingPlanQuiz onComplete={handleQuizComplete} />
            </div>
          ) : plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const customPlan = plan.custom_plan_result_id ? customPlanData[plan.custom_plan_result_id] : null;
                
                return (
                  <Card key={plan.id} className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getPlanTypeIcon(plan.plan_type)}
                          <span className="text-sm text-gray-400 ml-2">
                            {getPlanTypeLabel(plan.plan_type)}
                          </span>
                        </div>
                        {customPlan && (
                          <Badge className="bg-sinner-red">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${customPlan.selected_plan_price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      <CardTitle>{customPlan?.selected_plan_name || plan.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Created on {new Date(plan.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {customPlan && customPlan.plan_features ? (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Plan Features:</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {customPlan.plan_features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300 whitespace-pre-line">
                          {plan.description || "No description available."}
                        </p>
                      )}
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                You've completed our training plan quiz. 
                Our coaches are reviewing your responses and will create a personalized plan for you soon.
              </p>
              <Button 
                onClick={() => setShowQuiz(true)}
                className="bg-sinner-red hover:bg-red-700"
              >
                Retake Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlans;
