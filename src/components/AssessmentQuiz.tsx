
import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

type AssessmentQuizProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const { toast } = useToast();
  
  if (!isOpen) return null;
  
  const questions = [
    {
      text: "What are your primary fitness goals?",
      options: ["Weight loss", "Muscle gain", "Strength improvement", "Athletic performance", "Overall health"]
    },
    {
      text: "How would you describe your current fitness level?",
      options: ["Beginner", "Intermediate", "Advanced", "Professional athlete", "Getting back into fitness"]
    },
    {
      text: "How many days per week can you commit to training?",
      options: ["1-2 days", "3-4 days", "5-6 days", "Every day", "Variable schedule"]
    },
    {
      text: "Do you have access to a gym or home equipment?",
      options: ["Full gym access", "Basic home equipment", "No equipment", "Outdoor training only", "Mix of gym and home"]
    }
  ];
  
  const handleSelectOption = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: option
    });
  };
  
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit assessment
      toast({
        title: "Assessment Completed",
        description: "Thank you for completing the assessment. We'll be in touch with your custom program details.",
      });
      onClose();
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-2">Fitness Assessment Quiz</h2>
        <p className="text-gray-400 mb-4">This assessment helps us determine the best program for your needs.</p>
        
        <div className="mb-3">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-400 mt-2">Question {currentQuestion + 1} of {questions.length}</p>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">{questions[currentQuestion].text}</h3>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, idx) => (
              <div 
                key={idx}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswers[currentQuestion] === option 
                    ? 'border-primary bg-primary/20' 
                    : 'border-gray-700 hover:bg-gray-800'
                }`}
                onClick={() => handleSelectOption(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuestion]}
          >
            {currentQuestion < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Complete"
            )}
          </Button>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          Note: Your responses help us customize your pricing. You'll receive a personalized quote after completing the assessment.
        </p>
      </div>
    </div>
  );
};

export default AssessmentQuiz;
