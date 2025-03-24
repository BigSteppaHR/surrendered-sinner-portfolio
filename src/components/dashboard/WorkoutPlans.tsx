
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, FileText, Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  plan_type: 'workout' | 'meal';
}

const WorkoutPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        toast({
          title: "Failed to load workout plans",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, [user]);

  // Function to handle PDF download
  const handleDownload = async (plan: WorkoutPlan) => {
    if (!plan.pdf_url) {
      toast({
        title: "No PDF available",
        description: "This plan doesn't have a PDF attached",
        variant: "destructive",
      });
      return;
    }
    
    try {
      window.open(plan.pdf_url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Failed to download file",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Your Training</CardTitle>
        <CardDescription className="text-gray-400">Workout and meal plans</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : plans.length > 0 ? (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className="p-4 rounded-md bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {plan.plan_type === 'workout' ? (
                      <FileIcon className="h-5 w-5 mr-2 text-primary" />
                    ) : (
                      <Coffee className="h-5 w-5 mr-2 text-green-500" />
                    )}
                    <div>
                      <h4 className="font-semibold text-white">{plan.title}</h4>
                      {plan.description && (
                        <p className="text-sm text-gray-400">{plan.description}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(plan)}
                      disabled={!plan.pdf_url}
                      className="flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No workout plans available yet.</p>
            <p className="text-sm mt-2">Your coach will assign workout and meal plans soon.</p>
            <Button 
              className="mt-4 bg-red-600 hover:bg-red-700"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "This feature will be available soon!",
                });
              }}
            >
              Start Training
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutPlans;
