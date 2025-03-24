
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowRight } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type PlanType = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  plan_type: string;
  created_at: string;
};

const TrainingPlans = () => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      if (!profile?.id) return;

      try {
        setIsLoadingPlans(true);
        const { data, error } = await supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPlans(data || []);
      } catch (error: any) {
        console.error("Error fetching plans:", error.message);
        toast({
          title: "Failed to load plans",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPlans(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      fetchPlans();
    }
  }, [isAuthenticated, isLoading, profile?.id, toast]);

  const handleDownload = async (url: string | null, title: string) => {
    if (!url) {
      toast({
        title: "Download failed",
        description: "No PDF available for this plan",
        variant: "destructive",
      });
      return;
    }

    try {
      // For demo purposes, we're just opening the URL in a new tab
      window.open(url, "_blank");
      
      toast({
        title: "Download started",
        description: `${title} is being downloaded`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
        <div className="animate-spin h-8 w-8 border-4 border-[#9b87f5] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A1F2C] text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9b87f5] to-purple-400">
              Your Training Plans
            </h1>
            <p className="text-gray-400 mt-1">
              Download your custom training plans created specifically for your goals
            </p>
          </div>

          {isLoadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#252A38] border-[#353A48] animate-pulse">
                  <CardHeader className="pb-0">
                    <div className="h-6 w-3/4 bg-[#353A48] rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-[#353A48] rounded"></div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-20 bg-[#353A48] rounded mb-4"></div>
                    <div className="h-10 bg-[#353A48] rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="bg-[#252A38] border-[#353A48] overflow-hidden hover:shadow-lg hover:shadow-[#9b87f5]/5 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.title}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)} Plan
                        </CardDescription>
                      </div>
                      <div className="p-2 bg-[#9b87f5]/10 text-[#9b87f5] rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-4 min-h-[60px]">
                      {plan.description || "Custom training plan tailored to your specific goals and needs."}
                    </p>
                    <Button
                      className="w-full bg-[#9b87f5] hover:bg-[#8a76e4] transition-colors"
                      onClick={() => handleDownload(plan.pdf_url, plan.title)}
                      disabled={!plan.pdf_url}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-[#252A38] border-[#353A48]">
              <CardContent className="p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Training Plans Yet</h3>
                  <p className="text-gray-400 mb-6">
                    You don't have any training plans assigned yet. Subscribe to a package or contact your trainer.
                  </p>
                  <Button className="bg-[#9b87f5] hover:bg-[#8a76e4]">
                    View Packages <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Section */}
          {plans.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Your Program Progress</h2>
              <Card className="bg-[#252A38] border-[#353A48]">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Strength Training</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" indicatorClassName="bg-[#9b87f5]" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Cardio Endurance</span>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                      <Progress value={60} className="h-2" indicatorClassName="bg-[#7E69AB]" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Nutrition Plan</span>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                      <Progress value={40} className="h-2" indicatorClassName="bg-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlans;
