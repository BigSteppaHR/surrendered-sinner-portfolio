import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ChevronsRight, ChevronsLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { subscriptionPlans } from './payment/SubscriptionData';
import { supabase } from '@/integrations/supabase/client';

const CustomPlanQuiz = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update the questions to match our new plan structure
  const questions = [
    {
      id: 'experience',
      question: 'What is your level of training experience?',
      options: [
        { value: 'beginner', label: 'Beginner (0-2 years of consistent training)' },
        { value: 'intermediate', label: 'Intermediate (2-5 years of serious training)' },
        { value: 'advanced', label: 'Advanced (5+ years of dedicated training)' }
      ]
    },
    {
      id: 'goals',
      question: 'What are your primary fitness goals?',
      options: [
        { value: 'general', label: 'General fitness and muscle building' },
        { value: 'strength', label: 'Strength and power development' },
        { value: 'bodybuilding', label: 'Bodybuilding and aesthetics' },
        { value: 'competition', label: 'Preparing for a bodybuilding competition' }
      ]
    },
    {
      id: 'enhancement',
      question: 'Will your training include performance enhancement protocols?',
      options: [
        { value: 'no', label: 'No, natural training only' },
        { value: 'considering', label: 'Considering or planning first cycle' },
        { value: 'yes', label: 'Yes, currently using or experienced with PEDs' }
      ]
    },
    {
      id: 'timeframe',
      question: 'What is your training timeframe?',
      options: [
        { value: 'flexible', label: 'Flexible, no specific deadline' },
        { value: 'shorterm', label: 'Short-term goal (3-6 months)' },
        { value: 'competition', label: 'Preparing for a specific competition date' }
      ]
    },
    {
      id: 'support',
      question: 'What level of coaching support do you need?',
      options: [
        { value: 'basic', label: 'Basic guidance and program design' },
        { value: 'moderate', label: 'Regular check-ins and adjustments' },
        { value: 'intensive', label: 'Intensive coaching with frequent communication' }
      ]
    }
  ];

  const handleNext = () => {
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Update the recommendation logic 
  const determineRecommendedPlan = () => {
    // Default to beginner if not enough info
    let recommendedPlan = 'beginner';
    
    const experienceAnswer = answers['experience'];
    const goalsAnswer = answers['goals'];
    const enhancementAnswer = answers['enhancement'];
    const timeframeAnswer = answers['timeframe'];
    const supportAnswer = answers['support'];
    
    // Competition prep plan recommendation
    if (goalsAnswer === 'competition' || timeframeAnswer === 'competition') {
      recommendedPlan = 'competition';
    }
    // Advanced enhancement plan recommendation
    else if (enhancementAnswer === 'yes' || (enhancementAnswer === 'considering' && experienceAnswer === 'advanced')) {
      recommendedPlan = 'advanced';
    }
    // Intermediate plan recommendation
    else if (experienceAnswer === 'intermediate' || 
             (experienceAnswer === 'advanced' && enhancementAnswer === 'no') ||
             supportAnswer === 'moderate') {
      recommendedPlan = 'intermediate';
    }
    // Beginner plan recommendation for everyone else
    else {
      recommendedPlan = 'beginner';
    }
    
    return recommendedPlan;
  };

  // Update the handleFinish function
  const handleFinish = async () => {
    setIsSubmitting(true);
    
    try {
      const recommendedPlan = determineRecommendedPlan();
      
      // Store quiz results if user is logged in
      if (isAuthenticated && user) {
        const { data, error } = await supabase.from('custom_plan_results').insert({
          user_id: user.id,
          quiz_answers: answers,
          selected_plan_id: recommendedPlan,
          selected_plan_name: subscriptionPlans.find(p => p.id === recommendedPlan)?.name || 'Custom Plan',
          selected_plan_price: subscriptionPlans.find(p => p.id === recommendedPlan)?.priceValue || 0,
          is_purchased: false
        }).select();
        
        if (error) throw error;
        
        // Navigate to plans page with recommendation
        navigate('/plans-catalog', { 
          state: { 
            recommendedPlanId: recommendedPlan,
            quizResultId: data[0].id 
          } 
        });
      } else {
        // For non-authenticated users, just navigate with recommendation
        navigate('/plans-catalog', { 
          state: { 
            recommendedPlanId: recommendedPlan 
          } 
        });
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to process quiz results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Fitness Plan Assessment
        </CardTitle>
        <CardDescription className="text-gray-400">
          Answer a few questions to find the best plan for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="question" className="text-sm font-medium">
            {questions[currentQuestion].question}
          </Label>
          <RadioGroup defaultValue={answers[questions[currentQuestion].id]} onValueChange={(value) => handleAnswerChange(questions[currentQuestion].id, value)}>
            <div className="grid gap-2">
              {questions[currentQuestion].options.map((option) => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem value={option.value} id={option.value} className="bg-zinc-800 text-white border-zinc-700 focus:ring-sinner-red" />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <ChevronsLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        {currentQuestion === questions.length - 1 ? (
          <Button onClick={handleFinish} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Processing...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Get Recommendation
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            Next
            <ChevronsRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CustomPlanQuiz;
