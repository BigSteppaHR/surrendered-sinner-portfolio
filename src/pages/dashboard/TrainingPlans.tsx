
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TrainingPlans = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load plans data here
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };
    
    loadData();
  }, []);
  
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
      
      <Card className="bg-[#111111] border-[#333333] mb-6">
        <CardHeader>
          <CardTitle>Your Training Plans</CardTitle>
          <CardDescription>Access your custom workout programs</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Training plans content will go here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingPlans;
