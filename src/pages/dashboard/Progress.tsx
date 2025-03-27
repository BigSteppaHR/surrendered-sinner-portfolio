
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import WeightChart from "@/components/dashboard/WeightChart";
import WeightTracker from "@/components/dashboard/WeightTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Weight, TrendingUp, Calendar } from "lucide-react";

const Progress = () => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
        <DashboardNav />
        <div className="flex-1 overflow-auto md:ml-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      <div className="flex-1 overflow-auto md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Progress Tracking</h1>
            <p className="text-gray-400 mt-1">Monitor your fitness journey and achievements</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#ea384c]/10 data-[state=active]:text-[#ea384c]">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="weight" className="data-[state=active]:bg-[#ea384c]/10 data-[state=active]:text-[#ea384c]">
                <Weight className="h-4 w-4 mr-2" />
                Weight
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-[#ea384c]/10 data-[state=active]:text-[#ea384c]">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#ea384c]/10 data-[state=active]:text-[#ea384c]">
                <Calendar className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Weight className="h-5 w-5 text-[#ea384c]" />
                      Weight Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WeightChart />
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#ea384c]" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="weight">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="h-5 w-5 text-[#ea384c]" />
                    Weight Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WeightTracker />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#ea384c]" />
                    Strength & Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <PerformanceChart />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#ea384c]" />
                    Workout History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-400 py-8">
                    Your workout history will be displayed here once you complete some sessions.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Progress;
