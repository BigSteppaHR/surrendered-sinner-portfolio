
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AssessmentQuizProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  if (!isOpen) return null;
  
  const questions = [
    {
      text: "What are your primary fitness goals?",
      options: ["Weight loss", "Muscle gain", "Strength improvement", "Athletic performance", "Overall health"]
    }
  ];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Fitness Assessment Quiz</h2>
        <p className="text-gray-400 mb-8">This assessment helps us determine the best program for your needs and provide accurate pricing.</p>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">{questions[currentQuestion].text}</h3>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, idx) => (
              <div 
                key={idx}
                className="p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
              >
                {option}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Continue
          </Button>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          Note: This is a demonstration version. The full assessment would calculate pricing based on your specific needs.
        </p>
      </div>
    </div>
  );
};

export default AssessmentQuiz;
