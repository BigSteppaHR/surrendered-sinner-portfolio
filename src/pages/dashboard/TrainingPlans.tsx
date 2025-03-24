
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CalendarDays, Clock, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type WorkoutPlan = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  plan_type: string;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
};

const TrainingPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  
  useEffect(() => {
    // Load plans data
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!user) return;
        
        // Fetch user's workout plans
        const { data, error } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPlans(data || []);
      } catch (error) {
        console.error('Error loading plans:', error);
        toast({
          title: "Error loading plans",
          description: "There was a problem fetching your training plans.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, toast]);
  
  const handleDownload = async (planId: string, pdfUrl: string | null) => {
    if (!pdfUrl) {
      toast({
        title: "No PDF available",
        description: "This plan doesn't have a downloadable PDF.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Handle PDF download - open in new tab
      window.open(pdfUrl, '_blank');
      
      toast({
        title: "Download started",
        description: "Your training plan is downloading.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading the PDF.",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-blue-500 text-white';
      case 'hypertrophy': return 'bg-purple-500 text-white';
      case 'endurance': return 'bg-green-500 text-white';
      case 'weight_loss': return 'bg-red-500 text-white';
      case 'custom': return 'bg-sinner-red text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#333333] rounded w-1/4"></div>
          <div className="h-4 bg-[#333333] rounded w-2/4"></div>
          <div className="h-64 bg-[#333333] rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Training Plans</h1>
        <p className="text-gray-400 mt-1">View and manage your personalized training programs</p>
      </div>
      
      {plans.length === 0 ? (
        <Card className="bg-[#111111] border-[#333333] mb-6">
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Training Plans Yet</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                You don't have any training plans assigned yet. Request a consultation with a coach to get a personalized training plan.
              </p>
              <Button className="bg-sinner-red hover:bg-red-700">
                Request Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-[#111111] border-[#333333] overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Created on {formatDate(plan.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className={getPlanTypeColor(plan.plan_type)}>
                    {plan.plan_type.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-300 mb-4">
                  {plan.description || "No description available for this training plan."}
                </p>
                
                <div className="flex flex-col space-y-2 pb-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <CalendarDays className="h-4 w-4 mr-2 text-sinner-red" />
                    <span>8-week program</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-2 text-sinner-red" />
                    <span>4 sessions per week</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Dumbbell className="h-4 w-4 mr-2 text-sinner-red" />
                    <span>Intermediate level</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-[#0D0D0D] border-t border-[#333333] pt-3">
                <Button 
                  className="w-full bg-sinner-red hover:bg-red-700 flex items-center justify-center"
                  onClick={() => handleDownload(plan.id, plan.pdf_url)}
                  disabled={!plan.pdf_url}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {plan.pdf_url ? "Download PDF" : "No PDF Available"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingPlans;
