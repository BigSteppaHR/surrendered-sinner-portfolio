
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SubscriptionPlans from "./payment/SubscriptionPlans";

const quizQuestions = [
  {
    id: "goal",
    question: "What's your primary fitness goal?",
    options: [
      { id: "lose-weight", label: "Lose weight" },
      { id: "build-muscle", label: "Build muscle" },
      { id: "increase-strength", label: "Increase strength" },
      { id: "general-fitness", label: "Improve overall fitness" }
    ]
  },
  {
    id: "experience",
    question: "What's your experience level with fitness?",
    options: [
      { id: "beginner", label: "Beginner" },
      { id: "intermediate", label: "Intermediate" },
      { id: "advanced", label: "Advanced" }
    ]
  },
  {
    id: "time",
    question: "How much time can you dedicate to training each week?",
    options: [
      { id: "minimal", label: "2-3 hours" },
      { id: "moderate", label: "4-6 hours" },
      { id: "significant", label: "7+ hours" }
    ]
  },
  {
    id: "preference",
    question: "What type of training do you prefer?",
    options: [
      { id: "weights", label: "Weight training" },
      { id: "cardio", label: "Cardio" },
      { id: "mixed", label: "Mixed (weights and cardio)" },
      { id: "bodyweight", label: "Bodyweight exercises" }
    ]
  },
  {
    id: "diet",
    question: "How would you describe your current nutrition?",
    options: [
      { id: "poor", label: "Needs improvement" },
      { id: "moderate", label: "Somewhat balanced" },
      { id: "good", label: "Well-balanced" },
      { id: "specific", label: "Following a specific diet" }
    ]
  }
];

export default function CustomPlanQuiz() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [quizResultId, setQuizResultId] = useState(null);
  
  const handleNextQuestion = () => {
    if (!currentAnswer) {
      toast({
        title: "Selection required",
        description: "Please select an option to continue",
        variant: "destructive",
      });
      return;
    }

    // Save current answer
    const updatedAnswers = { ...answers, [quizQuestions[currentQuestion].id]: currentAnswer };
    setAnswers(updatedAnswers);
    
    if (currentQuestion < quizQuestions.length - 1) {
      // Go to next question
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer("");
    } else {
      // Quiz completed - determine plan recommendation
      handleQuizCompletion(updatedAnswers);
    }
  };
  
  const determineRecommendedPlan = (quizAnswers) => {
    // Simple algorithm to determine recommended plan based on answers
    
    if (quizAnswers.goal === "lose-weight" || quizAnswers.diet === "poor" || quizAnswers.diet === "moderate") {
      return "nutrition"; // Nutrition focused plan
    }
    
    if (quizAnswers.goal === "build-muscle" || quizAnswers.goal === "increase-strength" || 
        quizAnswers.preference === "weights") {
      return "lifting"; // Lifting program
    }
    
    if (quizAnswers.experience === "advanced" || quizAnswers.time === "significant") {
      return "premium"; // Premium plan for serious athletes
    }
    
    // Default to premium as a safe choice
    return "premium";
  };
  
  const handleQuizCompletion = async (finalAnswers) => {
    setIsSubmitting(true);
    
    try {
      // Determine recommended plan
      const recommendedPlanId = determineRecommendedPlan(finalAnswers);
      setRecommendedPlan(recommendedPlanId);
      
      if (isAuthenticated && user) {
        // Save quiz results to database
        const { data: resultData, error } = await supabase
          .from('custom_plan_results')
          .insert({
            user_id: user.id,
            quiz_answers: finalAnswers,
            selected_plan_id: recommendedPlanId,
            selected_plan_name: recommendedPlanId === "nutrition" 
              ? "Nutrition Plan" 
              : recommendedPlanId === "lifting" 
                ? "Lifting Program" 
                : "Complete Coaching",
            selected_plan_price: recommendedPlanId === "nutrition" 
              ? 150 
              : recommendedPlanId === "lifting" 
                ? 175 
                : 299
          })
          .select('id')
          .single();
          
        if (error) {
          console.error("Error saving quiz results:", error);
          toast({
            title: "Error",
            description: "There was an issue saving your quiz results",
            variant: "destructive",
          });
        } else if (resultData) {
          setQuizResultId(resultData.id);
        }
      }
      
      // Show results dialog
      setQuizComplete(true);
      
    } catch (error) {
      console.error("Error in quiz completion:", error);
      toast({
        title: "Something went wrong",
        description: "Unable to process your quiz results",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {!quizComplete ? (
        <Card className="w-full bg-gray-900 border-gray-700 shadow-lg text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-white">Custom Training Plan Quiz</CardTitle>
              <Badge className="bg-red-600">Question {currentQuestion + 1}/{quizQuestions.length}</Badge>
            </div>
            <CardDescription className="text-gray-300">
              Answer a few questions to get your personalized training recommendation
            </CardDescription>
            <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-4">
              <h3 className="text-xl font-semibold mb-4 text-white">{quizQuestions[currentQuestion].question}</h3>
              <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizQuestions[currentQuestion].options.map((option) => (
                    <div key={option.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={option.id} 
                        id={option.id} 
                        className="mt-1 border-gray-500 text-red-600"
                      />
                      <Label 
                        htmlFor={option.id} 
                        className="text-md text-gray-300 cursor-pointer pb-2 block"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleNextQuestion} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {currentQuestion < quizQuestions.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  {isSubmitting ? 'Processing...' : 'Get Your Plan'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full bg-gray-900 border-gray-700 shadow-lg text-white">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
              <CardTitle className="text-2xl text-white">Your Custom Plan Recommendation</CardTitle>
              <CardDescription className="text-gray-300 mt-2">
                Based on your responses, we've identified the best plan for your goals
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-4">
              <h3 className="text-xl font-semibold mb-2 text-center text-white">
                We Recommend:
              </h3>
              
              <SubscriptionPlans 
                initialSelectedPlan={recommendedPlan} 
                quizResultId={quizResultId}
              />
              
              <div className="mt-8">
                <Separator className="my-4 bg-gray-700" />
                <h4 className="text-lg font-medium mb-2 text-white">What's Next?</h4>
                <p className="text-gray-300">
                  Select your plan and subscribe to get immediate access to your personalized training program. 
                  Our expert coaches will customize your plan based on your quiz answers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login prompt dialog - shown when non-authenticated users try to access plans */}
      <Dialog open={false}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Sign in to continue</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">
              Please sign in or create an account to access your personalized training plan.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => navigate('/login', { state: { returnTo: '/custom-plan' } })}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/signup', { state: { returnTo: '/custom-plan' } })}
              variant="outline"
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
