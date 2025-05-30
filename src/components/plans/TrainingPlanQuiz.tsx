
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Check, X, LogIn, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface QuizStep {
  question: string;
  options: string[];
  key: string;
}

const quizSteps: QuizStep[] = [
  {
    question: "What is your primary fitness goal?",
    options: ["Weight Loss", "Muscle Building", "Athletic Performance", "Overall Health", "Competition Prep"],
    key: "goal"
  },
  {
    question: "How many days per week can you train?",
    options: ["2-3 days", "3-4 days", "4-5 days", "5-6 days", "6-7 days"],
    key: "frequency"
  },
  {
    question: "What's your current fitness level?",
    options: ["Beginner", "Intermediate", "Advanced", "Elite"],
    key: "level"
  },
  {
    question: "Do you have any specific areas you want to focus on?",
    options: ["Upper Body", "Lower Body", "Core/Abs", "Full Body", "Specific Sport Training"],
    key: "focus"
  },
  {
    question: "What type of training do you prefer?",
    options: ["Strength Training", "Cardio", "HIIT", "Bodybuilding", "Functional Training", "Mixed"],
    key: "type"
  }
];

interface TrainingPlanQuizProps {
  onComplete: () => void;
}

const TrainingPlanQuiz = ({ onComplete }: TrainingPlanQuizProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [planDetails, setPlanDetails] = useState<{
    name: string;
    price: number;
    discountedPrice: number;
    planType: string;
    features: string[];
  } | null>(null);
  
  useEffect(() => {
    // Check for saved quiz data in sessionStorage when component mounts
    const savedAnswers = sessionStorage.getItem('dashboardPendingQuizAnswers');
    const savedStep = sessionStorage.getItem('dashboardPendingQuizStep');
    
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
        
        // If we have all answers, simulate quiz completion
        if (Object.keys(parsedAnswers).length === quizSteps.length) {
          processResults(parsedAnswers);
        }
        
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        
        // Clear storage after restoring
        sessionStorage.removeItem('dashboardPendingQuizAnswers');
        sessionStorage.removeItem('dashboardPendingQuizStep');
      } catch (e) {
        console.error('Error restoring saved quiz state:', e);
      }
    }
  }, []);
  
  const handleSelect = (option: string) => {
    if (currentStep >= quizSteps.length) return;
    
    const newAnswers = { ...answers, [quizSteps[currentStep].key]: option };
    setAnswers(newAnswers);
    
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      processResults(newAnswers);
    }
  };
  
  const processResults = (results: Record<string, string>) => {
    // Determine the plan type and price based on quiz answers
    let planType = "custom";
    // Increased base prices
    let planPrice = 199.99; // Default price increase from 149.99
    let planName = `Custom ${results.goal} Plan`;
    
    if (results.goal === "Competition Prep") {
      planType = "competition";
      planPrice = 399.99; // Increased from 299.99
    } else if (results.goal === "Weight Loss") {
      planType = "weight_loss";
      planPrice = 249.99; // Increased from 179.99
    } else if (results.goal === "Muscle Building") {
      planType = "muscle_building";
      planPrice = 279.99; // Increased from 199.99
    }
    
    if (results.level === "Advanced" || results.level === "Elite") {
      planPrice += 75; // Increased from 50
    }
    
    // Apply small discount (5%) for taking the quiz
    const discountedPrice = parseFloat((planPrice * 0.95).toFixed(2));
    
    // Create plan features
    const features = [
      `Personalized ${results.goal} program`,
      `Designed for ${results.level} fitness level`,
      `Optimized for ${results.frequency} training frequency`,
      `Focus on ${results.focus} development`,
      `${results.type} training methodology`,
      `5% discount for completing the quiz`
    ];
    
    // Set plan details
    setPlanDetails({
      name: planName,
      price: planPrice,
      discountedPrice: discountedPrice,
      planType: planType,
      features: features
    });
    
    setQuizCompleted(true);
    
    // If not authenticated, we'll show options instead of immediately submitting
    if (!isAuthenticated) {
      setRequiresAuth(false); // Don't immediately show auth screen
      return;
    }
    
    // If authenticated, continue to save result
    submitQuizResults(results);
  };
  
  const submitQuizResults = async (results: Record<string, string>) => {
    if (!profile?.id) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your quiz results",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!planDetails) {
        throw new Error("Plan details not available");
      }
      
      const { data: customPlanResult, error: customPlanError } = await supabase
        .from('custom_plan_results')
        .insert({
          user_id: profile.id,
          quiz_answers: results,
          selected_plan_name: planDetails.name,
          selected_plan_price: planDetails.discountedPrice,
          plan_features: planDetails.features
        })
        .select()
        .single();
        
      if (customPlanError) throw customPlanError;
      
      const { error: workoutError } = await supabase
        .rpc('add_custom_plan_to_workout_plans', {
          p_user_id: profile.id,
          p_custom_plan_result_id: customPlanResult.id
        });
      
      if (workoutError) throw workoutError;
      
      toast({
        title: "Quiz completed",
        description: "Your custom plan has been created and added to your dashboard."
      });
      
      onComplete();
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit quiz results",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const redirectToLogin = () => {
    // Store quiz state in sessionStorage
    sessionStorage.setItem('dashboardPendingQuizAnswers', JSON.stringify(answers));
    sessionStorage.setItem('dashboardPendingQuizStep', currentStep.toString());
    navigate('/login', { state: { redirectAfterLogin: '/dashboard/plans' } });
  };

  const goToDashboard = () => {
    navigate('/dashboard/plans');
  };

  if (isSubmitting) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">Submitting Your Results</CardTitle>
          <CardDescription className="text-center text-gray-400">
            We're processing your training preferences...
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-center text-gray-300 mt-4">
            Creating your personalized training recommendation
          </p>
        </CardContent>
      </Card>
    );
  }

  if (requiresAuth) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">Authentication Required</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Please log in to complete your quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button 
            variant="default" 
            onClick={redirectToLogin}
            className="w-full"
          >
            Log in
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (quizCompleted && planDetails) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">Your Personalized Plan</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Based on your answers, we've created a custom plan just for you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-xl font-bold mb-2">{planDetails.name}</h3>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-sinner-red">${planDetails.discountedPrice}</span>
              <span className="text-sm text-gray-400 line-through ml-2">${planDetails.price}</span>
              <span className="text-sm text-green-400 ml-2">Save 5%</span>
            </div>
            <div className="space-y-2">
              {planDetails.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
          {isAuthenticated ? (
            <Button 
              onClick={goToDashboard}
              className="w-full sm:w-auto bg-sinner-red hover:bg-red-700"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Purchase Plan
            </Button>
          ) : (
            <Button 
              onClick={redirectToLogin}
              className="w-full sm:w-auto bg-sinner-red hover:bg-red-700"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign Up to Purchase
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => {
              setQuizCompleted(false);
              setCurrentStep(0);
              setAnswers({});
            }}
            className="w-full sm:w-auto border-gray-700"
          >
            Retake Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep < quizSteps.length) {
    const currentQuestion = quizSteps[currentStep];
    
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-400">
              Question {currentStep + 1} of {quizSteps.length}
            </div>
            <div className="flex space-x-1">
              {quizSteps.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full w-4 ${index === currentStep ? 'bg-primary' : index < currentStep ? 'bg-primary/60' : 'bg-gray-700'}`}
                ></div>
              ))}
            </div>
          </div>
          <CardTitle className="text-center text-xl md:text-2xl">
            {currentQuestion.question}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Select the option that best describes your preference
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                className="w-full p-4 text-left rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all flex justify-between items-center"
                onClick={() => handleSelect(option)}
              >
                <span>{option}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
          
          {currentStep > 0 && (
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={goBack}
                className="text-sm text-gray-400 hover:text-white"
              >
                Go back to previous question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TrainingPlanQuiz;
