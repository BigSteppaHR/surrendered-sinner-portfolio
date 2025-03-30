
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ChevronLeft, ChevronRight, Dumbbell, Flame, Scale, Timer, Activity, Target, X, LogIn, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/safe-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type QuizQuestion = {
  id: string;
  question: string;
  description?: string;
  options: {
    id: string;
    label: string;
    value: string;
    icon?: React.ReactNode;
  }[];
};

type RecommendedPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  recommended?: boolean;
  color?: string;
};

const CustomPlanQuiz = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlans, setRecommendedPlans] = useState<RecommendedPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  
  const questions: QuizQuestion[] = [
    {
      id: 'goal',
      question: 'What is your primary fitness goal?',
      description: 'This helps us understand what you want to achieve',
      options: [
        { id: 'goal-1', label: 'Lose Weight', value: 'weight-loss', icon: <Scale className="w-5 h-5 text-sinner-red" /> },
        { id: 'goal-2', label: 'Build Muscle', value: 'muscle-gain', icon: <Dumbbell className="w-5 h-5 text-sinner-red" /> },
        { id: 'goal-3', label: 'Improve Fitness', value: 'fitness', icon: <Activity className="w-5 h-5 text-sinner-red" /> },
        { id: 'goal-4', label: 'Athletic Performance', value: 'performance', icon: <Flame className="w-5 h-5 text-sinner-red" /> },
      ],
    },
    {
      id: 'experience',
      question: 'What is your current fitness level?',
      description: 'Be honest - this helps us tailor your plan appropriately',
      options: [
        { id: 'exp-1', label: 'Beginner', value: 'beginner' },
        { id: 'exp-2', label: 'Intermediate', value: 'intermediate' },
        { id: 'exp-3', label: 'Advanced', value: 'advanced' },
        { id: 'exp-4', label: 'Elite/Athlete', value: 'elite' },
      ],
    },
    {
      id: 'time',
      question: 'How much time can you commit per week?',
      description: "We will design a plan that fits your schedule",
      options: [
        { id: 'time-1', label: '2-3 hours', value: 'minimal', icon: <Timer className="w-5 h-5 text-sinner-red" /> },
        { id: 'time-2', label: '4-5 hours', value: 'moderate', icon: <Timer className="w-5 h-5 text-sinner-red" /> },
        { id: 'time-3', label: '6-8 hours', value: 'substantial', icon: <Timer className="w-5 h-5 text-sinner-red" /> },
        { id: 'time-4', label: '9+ hours', value: 'maximum', icon: <Timer className="w-5 h-5 text-sinner-red" /> },
      ],
    },
    {
      id: 'equipment',
      question: 'What equipment do you have access to?',
      description: "We will work with what you have available",
      options: [
        { id: 'equip-1', label: 'Home (minimal)', value: 'minimal' },
        { id: 'equip-2', label: 'Home Gym', value: 'home-gym' },
        { id: 'equip-3', label: 'Full Gym Access', value: 'full-gym' },
        { id: 'equip-4', label: 'Access to Specialty Equipment', value: 'specialty' },
      ],
    },
    {
      id: 'coaching',
      question: 'What level of coaching do you want?',
      description: 'More coaching means more personalization and accountability',
      options: [
        { id: 'coach-1', label: 'Self-guided Plan', value: 'self-guided' },
        { id: 'coach-2', label: 'Check-ins Weekly', value: 'weekly' },
        { id: 'coach-3', label: 'Regular Coaching', value: 'regular' },
        { id: 'coach-4', label: 'Premium 1-on-1', value: 'premium' },
      ],
    },
    {
      id: 'nutrition',
      question: 'Are you interested in nutrition guidance?',
      description: 'Proper nutrition is essential for achieving your fitness goals',
      options: [
        { id: 'nutr-1', label: 'Basic Guidelines Only', value: 'basic' },
        { id: 'nutr-2', label: 'Meal Planning', value: 'meal-planning' },
        { id: 'nutr-3', label: 'Comprehensive Plan', value: 'comprehensive' },
        { id: 'nutr-4', label: 'None', value: 'none' },
      ],
    },
  ];
  
  const handleSelectOption = (value: string) => {
    setAnswers({
      ...answers,
      [questions[currentStep].id]: value,
    });
  };
  
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Process answers and show results
      analyzeResults();
      setShowResults(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setRecommendedPlans([]);
    setRequiresAuth(false);
  };
  
  const analyzeResults = () => {
    let plans: RecommendedPlan[] = [];
    
    // Enhanced recommendation logic based on goals, experience, and preferences
    const goal = answers['goal'];
    const experience = answers['experience'];
    const coaching = answers['coaching'];
    const nutrition = answers['nutrition'];
    
    // Nutrition plans
    if (nutrition === 'meal-planning' || nutrition === 'comprehensive') {
      plans.push({
        id: 'nutrition-standard',
        name: 'Personalized Nutrition Plan',
        description: 'Custom nutrition guidance tailored to your specific goals',
        price: 150,
        features: [
          'Personalized macro calculations',
          'Food preference accommodations',
          'Meal timing recommendations',
          'Grocery shopping list',
          'Sample meal ideas',
          '1 revision included'
        ],
        recommended: nutrition === 'comprehensive',
        color: 'bg-sinner-red'
      });
    }
    
    // Lifting programs
    if (goal === 'muscle-gain' || goal === 'performance') {
      const baseProgramPrice = 175;
      
      const programName = experience === 'advanced' || experience === 'elite' 
        ? 'Advanced Lifting Program' 
        : 'Progressive Lifting Program';
        
      plans.push({
        id: experience === 'advanced' || experience === 'elite' ? 'lifting-advanced' : 'lifting-standard',
        name: programName,
        description: 'Structured resistance training program to build strength and muscle',
        price: baseProgramPrice,
        features: [
          'Periodized training cycles',
          'Progressive overload system',
          'Form technique guidance',
          'Weekly workout schedule',
          'Exercise substitution options',
          '1 program revision included'
        ],
        recommended: goal === 'muscle-gain',
        color: 'bg-sinner-red'
      });
    }
    
    // Weight loss focused plan
    if (goal === 'weight-loss') {
      plans.push({
        id: 'weight-loss-plan',
        name: 'Weight Loss Program',
        description: 'Structured plan focused on sustainable fat loss',
        price: 175,
        features: [
          'Combined cardio and resistance training',
          'Calorie deficit guidelines',
          'Progress tracking tools',
          'Metabolic conditioning workouts',
          'Plateau-breaking strategies',
          'Weekly adjustment protocols'
        ],
        recommended: true,
        color: 'bg-sinner-red'
      });
    }
    
    // General fitness plan
    if (goal === 'fitness') {
      plans.push({
        id: 'general-fitness',
        name: 'Functional Fitness Program',
        description: 'Well-rounded plan to improve overall fitness and wellness',
        price: 150,
        features: [
          'Balanced training approach',
          'Cardiovascular conditioning',
          'Strength development',
          'Mobility and flexibility work',
          'Recovery protocols',
          'Progress assessments'
        ],
        recommended: true,
        color: 'bg-sinner-red'
      });
    }
    
    // Premium coaching option
    if (coaching === 'premium') {
      plans.push({
        id: 'premium-coaching',
        name: 'Elite 1:1 Coaching',
        description: 'Maximum support with personalized coaching and accountability',
        price: 299,
        features: [
          'Weekly video check-ins',
          'Custom programming',
          'Form analysis and feedback',
          'Nutrition guidance',
          'On-demand messaging',
          'Progress assessment',
          'Regular program updates'
        ],
        color: 'bg-sinner-red'
      });
    }
    
    // Add-ons can be presented separately at checkout
    
    // Ensure we always have at least one plan
    if (plans.length === 0) {
      plans.push({
        id: 'general-plan',
        name: 'Custom Fitness Plan',
        description: 'Personalized plan based on your specific needs and goals',
        price: 149,
        features: [
          'Customized workout program',
          'Nutrition guidelines',
          'Weekly check-ins',
          'Progress tracking',
          'Email support'
        ],
        recommended: true,
        color: 'bg-sinner-red'
      });
    }
    
    setRecommendedPlans(plans);
  };
  
  const handleSaveQuizResults = async (plan: RecommendedPlan) => {
    if (!isAuthenticated) {
      setRequiresAuth(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Store quiz results in the database, but don't create an actual plan yet
      const { data, error } = await supabase
        .from('custom_plan_results')
        .insert({
          user_id: profile?.id,
          quiz_answers: answers,
          selected_plan_id: plan.id,
          selected_plan_name: plan.name,
          selected_plan_price: plan.price,
          plan_features: plan.features
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Plan Saved",
        description: `${plan.name} has been saved to your account. You can purchase it from your dashboard.`,
      });
      
      // Redirect to subscription plans page instead of automatically adding to workout plans
      setIsDialogOpen(false);
      navigate('/plans-catalog', { state: { recommendedPlanId: plan.id } });
    } catch (error: any) {
      console.error("Error saving quiz results:", error);
      toast({
        title: "Error saving results",
        description: error.message || "There was a problem saving your quiz results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectToLogin = () => {
    setIsDialogOpen(false);
    // Store quiz state in sessionStorage
    sessionStorage.setItem('pendingQuizAnswers', JSON.stringify(answers));
    sessionStorage.setItem('pendingQuizStep', currentStep.toString());
    navigate('/login', { state: { redirectAfterLogin: '/plans-catalog' } });
  };
  
  // Restore quiz state if returning from login
  useEffect(() => {
    const pendingAnswers = sessionStorage.getItem('pendingQuizAnswers');
    const pendingStep = sessionStorage.getItem('pendingQuizStep');
    
    if (pendingAnswers) {
      try {
        setAnswers(JSON.parse(pendingAnswers));
        if (pendingStep) {
          const step = parseInt(pendingStep);
          setCurrentStep(step);
          // If this was the last step, show results
          if (step >= questions.length - 1) {
            setShowResults(true);
            analyzeResults();
          }
        }
        // Clear storage after restoring
        sessionStorage.removeItem('pendingQuizAnswers');
        sessionStorage.removeItem('pendingQuizStep');
      } catch (e) {
        console.error("Error restoring quiz state:", e);
      }
    }
    
    // Auto-open dialog if requested in URL
    if (window.location.search.includes('showQuiz=true')) {
      setIsDialogOpen(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated]);
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sinner-red hover:bg-red-700">
          <Target className="mr-2 h-4 w-4" />
          Find Your Perfect Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Dumbbell className="h-5 w-5 text-sinner-red mr-2" />
              Custom Training Plan Quiz
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Answer a few questions to get personalized program recommendations
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {requiresAuth ? (
            <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center">Login Required</CardTitle>
                <CardDescription className="text-center text-gray-400">
                  Create an account to save and purchase your custom plan
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                <p className="text-center text-gray-300 mb-6">
                  Your custom plan will be available for purchase after you sign in
                </p>
                <div className="flex space-x-4">
                  <Button 
                    onClick={redirectToLogin}
                    className="bg-sinner-red hover:bg-red-700"
                  >
                    Login or Sign Up
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setRequiresAuth(false)}
                  >
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isSubmitting ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-center text-gray-300 mt-4">
                Saving your custom plan...
              </p>
            </div>
          ) : !showResults ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Question {currentStep + 1} of {questions.length}</span>
                  <span className="font-medium">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
                </div>
                <Progress value={((currentStep + 1) / questions.length) * 100} className="h-2" />
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{questions[currentStep].question}</h3>
                {questions[currentStep].description && (
                  <p className="text-gray-400 text-sm">{questions[currentStep].description}</p>
                )}
              </div>
              
              <RadioGroup 
                value={answers[questions[currentStep].id] || ''} 
                onValueChange={handleSelectOption}
                className="space-y-3"
              >
                {questions[currentStep].options.map(option => (
                  <div 
                    key={option.id}
                    className={`flex items-center space-x-2 border border-zinc-700 rounded-lg p-4 transition-all ${
                      answers[questions[currentStep].id] === option.value 
                        ? 'bg-sinner-red/10 border-sinner-red' 
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.id} 
                      className="border-zinc-600"
                    />
                    <Label 
                      htmlFor={option.id} 
                      className="flex items-center w-full cursor-pointer"
                    >
                      {option.icon && <span className="mr-3">{option.icon}</span>}
                      <span className={`${
                        answers[questions[currentStep].id] === option.value 
                          ? 'font-medium' 
                          : ''
                      }`}>{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="border-zinc-700"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!answers[questions[currentStep].id]}
                  className="bg-sinner-red hover:bg-red-700"
                >
                  {currentStep === questions.length - 1 ? (
                    <>Get Results<ChevronRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Next<ChevronRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-sinner-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-sinner-red" />
                </div>
                <h3 className="text-xl font-bold mb-1">Your Recommended Plans</h3>
                <p className="text-gray-400 text-sm">
                  Based on your goals and preferences, we've selected these plans for you. Save them to view purchase options.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                {recommendedPlans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`border ${plan.recommended ? 'border-sinner-red' : 'border-zinc-800'} bg-zinc-900`}
                  >
                    {plan.recommended && (
                      <div className={`${plan.color || 'bg-sinner-red'} text-white text-xs uppercase font-bold py-1 px-3 text-center`}>
                        Recommended
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-2xl font-bold mb-2">
                        ${plan.price.toFixed(2)}
                      </div>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-sinner-red mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSaveQuizResults(plan)}
                        className={`w-full ${plan.recommended ? 'bg-sinner-red hover:bg-red-700' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        View Purchase Options
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={resetQuiz}
                  className="border-zinc-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-zinc-800 hover:bg-zinc-700"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomPlanQuiz;
