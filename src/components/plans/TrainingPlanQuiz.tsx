
import { useState } from "react";
import { ChevronRight, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSelect = (option: string) => {
    if (currentStep >= quizSteps.length) return;
    
    const newAnswers = { ...answers, [quizSteps[currentStep].key]: option };
    setAnswers(newAnswers);
    
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitQuizResults(newAnswers);
    }
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
      // Create a description based on the quiz results
      const description = `
        Goal: ${results.goal}
        Training frequency: ${results.frequency}
        Fitness level: ${results.level}
        Focus area: ${results.focus}
        Training type: ${results.type}
      `;
      
      // Determine the plan type based on quiz answers
      let planType = "custom";
      if (results.goal === "Competition Prep") {
        planType = "competition";
      } else if (results.goal === "Weight Loss") {
        planType = "weight_loss";
      } else if (results.goal === "Muscle Building") {
        planType = "muscle_building";
      }
      
      // Create a request in the database
      const { error } = await supabase
        .from('workout_plans')
        .insert({
          user_id: profile.id,
          title: `Custom plan based on ${results.goal}`,
          description: description.trim(),
          plan_type: planType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Quiz completed",
        description: "Your responses have been submitted. A coach will review and create your plan soon."
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

  // Skip to end if we're in submission state
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

  // Show the current quiz step
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
  
  // This shouldn't happen, but show a fallback if we're in an invalid state
  return null;
};

export default TrainingPlanQuiz;
