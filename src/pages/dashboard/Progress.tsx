
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Progress = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load progress data here
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
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <p className="text-gray-400 mt-1">Monitor your fitness and performance metrics</p>
      </div>
      
      <Card className="bg-[#111111] border-[#333333] mb-6">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your fitness journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Progress tracking content will go here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Progress;
