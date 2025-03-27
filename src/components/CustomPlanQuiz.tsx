import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ChevronLeft, ChevronRight, Dumbbell, Flame, Scale, Timer, Activity, Target, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/safe-dialog";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlans, setRecommendedPlans] = useState<RecommendedPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
  };
  
  const analyzeResults = () => {
    let plans: RecommendedPlan[] = [];
    
    // Simple recommendation logic based on goals and coaching needs
    const goal = answers['goal'];
    const experience = answers['experience'];
    const coaching = answers['coaching'];
    
    // Determine the base plan by combining goal and experience
    if (goal === 'weight-loss') {
      if (coaching === 'self-guided') {
        plans.push({
          id: 'basic-fat-loss',
          name: 'Basic Fat Loss Program',
          description: 'Self-guided program focused on sustainable fat loss through nutrition and exercise',
          price: 99,
          features: [
            'Customized workout plan',
            'Nutrition guidelines',
            'Weekly calorie targets',
            'Progress tracking templates',
            'Access to exercise library'
          ]
        });
      }
      
      if (coaching === 'weekly' || coaching === 'regular') {
        plans.push({
          id: 'coached-transformation',
          name: 'Coached Transformation',
          description: 'Guided fat loss program with accountability and adjustments',
          price: 199,
          features: [
            'Personalized workout plan',
            'Weekly check-ins with coach',
            'Customized nutrition plan',
            'Body composition analysis',
            'Progressive adjustments',
            'Private messaging with coach'
          ],
          recommended: true,
          color: 'bg-sinner-red'
        });
      }
      
      if (coaching === 'premium') {
        plans.push({
          id: 'premium-transformation',
          name: 'Elite Transformation',
          description: 'Our highest level of coaching and customization for optimal results',
          price: 349,
          features: [
            'Fully customized training protocol',
            '3x weekly check-ins with coach',
            'Personalized meal plans',
            'Regular body composition analysis',
            '24/7 coach access',
            'Recovery protocols',
            'Supplement guidance'
          ]
        });
      }
    }
    
    if (goal === 'muscle-gain') {
      if (coaching === 'self-guided') {
        plans.push({
          id: 'basic-muscle',
          name: 'Muscle Building Foundations',
          description: 'Self-guided hypertrophy program with focus on progressive overload',
          price: 99,
          features: [
            'Periodized strength program',
            'Caloric surplus guidelines',
            'Progressive overload system',
            'Form guides for key lifts',
            'Supplement recommendations'
          ]
        });
      }
      
      if (coaching === 'weekly' || coaching === 'regular') {
        plans.push({
          id: 'coached-hypertrophy',
          name: 'Coached Hypertrophy Program',
          description: 'Structured muscle building with regular feedback and adjustments',
          price: 199,
          features: [
            'Personalized hypertrophy plan',
            'Weekly technique assessment',
            'Nutrition plan for muscle gain',
            'Progress tracking',
            'Plateau-breaking strategies',
            'Email support'
          ],
          recommended: true,
          color: 'bg-sinner-red'
        });
      }
      
      if (coaching === 'premium') {
        plans.push({
          id: 'premium-physique',
          name: 'Elite Physique Development',
          description: 'Comprehensive coaching for maximum muscle development',
          price: 349,
          features: [
            'Advanced hypertrophy programming',
            'Video analysis of lifts',
            'Custom nutrition periodization',
            'Body composition optimization',
            'Recovery protocols',
            'Daily check-ins',
            'Unlimited coaching access'
          ]
        });
      }
    }
    
    if (goal === 'fitness' || goal === 'performance') {
      if (coaching === 'self-guided') {
        plans.push({
          id: 'basic-performance',
          name: 'Functional Fitness Plan',
          description: 'Self-guided program to improve overall fitness and performance',
          price: 99,
          features: [
            'Balanced workout program',
            'Conditioning protocols',
            'Mobility routines',
            'Performance tracking',
            'Nutrition basics'
          ]
        });
      }
      
      if (coaching === 'weekly' || coaching === 'regular') {
        plans.push({
          id: 'coached-performance',
          name: 'Performance Coaching',
          description: 'Structured program with regular coaching to improve athletic capacity',
          price: 199,
          features: [
            'Periodized training plan',
            'Weekly performance assessments',
            'Sport-specific drills',
            'Nutrition timing strategies',
            'Recovery optimization',
            'Bi-weekly coach calls'
          ],
          recommended: true,
          color: 'bg-sinner-red'
        });
      }
      
      if (coaching === 'premium') {
        plans.push({
          id: 'elite-performance',
          name: 'Elite Performance System',
          description: 'Comprehensive athletic development program with dedicated coaching',
          price: 349,
          features: [
            'Custom performance programming',
            'Movement screening',
            'Sport-specific skill development',
            'Periodized nutrition plan',
            'Recovery and regeneration protocols',
            'Video analysis',
            'Unlimited coaching access'
          ]
        });
      }
    }

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

    // Always offer an upsell option if not already included
    if (!plans.some(plan => plan.id.includes('premium'))) {
      plans.push({
        id: 'premium-coaching',
        name: 'Premium 1-on-1 Coaching',
        description: 'The ultimate coaching experience for transformative results',
        price: 399,
        features: [
          'Fully customized programming',
          'Daily check-ins with coach',
          'Unlimited messaging support',
          'Video analysis of form',
          'Detailed nutrition protocols',
          'Weekly strategy calls',
          'Supplement guidance',
          'Mental performance coaching'
        ]
      });
    }
    
    setRecommendedPlans(plans);
  };
  
  const handleSelectPlan = (plan: RecommendedPlan) => {
    toast({
      title: "Plan Selected",
      description: `${plan.name} has been added to your cart.`,
    });
    setIsDialogOpen(false);
    // In a real app, we would add this plan to the cart or redirect to checkout
  };
  
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
            <DialogDescription className="text-gray-400">
              Answer a few questions to get personalized program recommendations
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {!showResults ? (
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
                  Based on your goals and preferences, we've selected these plans for you
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
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full ${plan.recommended ? 'bg-sinner-red hover:bg-red-700' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                      >
                        Select Plan
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
