
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Clock, Plus, Check, AlertTriangle } from 'lucide-react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string | null;
  plan_type: string;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

const TrainingPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWorkoutPlans();
    }
  }, [user]);

  const fetchWorkoutPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      toast({
        variant: "destructive",
        title: "Failed to load plans",
        description: "There was a problem loading your training plans."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (plan: WorkoutPlan) => {
    if (!plan.pdf_url) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "This plan doesn't have a PDF available yet."
      });
      return;
    }

    try {
      // Open the PDF in a new tab
      window.open(plan.pdf_url, '_blank');
      
      toast({
        title: "Download initiated",
        description: "Your training plan PDF is being downloaded."
      });
    } catch (error) {
      console.error('Error downloading plan:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was a problem downloading your plan."
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Training Plans</h1>
            <Button 
              className="bg-[#ea384c] hover:bg-red-700 transition-colors"
              onClick={() => navigate('/plans-catalog')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Get New Plan
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[#ea384c] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : plans.length === 0 ? (
            <Card className="bg-zinc-900 border-[#333] hover:border-[#ea384c] transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center h-64">
                <FileText className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No Training Plans Yet</h3>
                <p className="text-gray-400 text-center mb-4">
                  You don't have any training plans yet. Get started by exploring our plan catalog.
                </p>
                <Button 
                  className="bg-[#ea384c] hover:bg-red-700 transition-colors"
                  onClick={() => navigate('/plans-catalog')}
                >
                  Browse Plans
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className="bg-zinc-900 border-[#333] hover:border-[#ea384c] transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{plan.title}</CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)} Plan
                        </CardDescription>
                      </div>
                      {plan.pdf_url ? (
                        <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Ready
                        </div>
                      ) : (
                        <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Processing
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {plan.description || "No description available for this training plan."}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Created: {format(new Date(plan.created_at), 'MMMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline"
                      className="border-[#333] text-gray-300 hover:bg-[#333] hover:text-white"
                      onClick={() => {
                        // View plan details (could expand in future)
                        toast({
                          title: "Plan Details",
                          description: "Detailed view coming soon!"
                        });
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    
                    <Button 
                      className={plan.pdf_url 
                        ? "bg-[#ea384c] hover:bg-red-700" 
                        : "bg-gray-700 hover:bg-gray-600 cursor-not-allowed"}
                      onClick={() => handleDownload(plan)}
                      disabled={!plan.pdf_url}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlans;
