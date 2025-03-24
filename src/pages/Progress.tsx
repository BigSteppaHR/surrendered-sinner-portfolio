
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { WeightRecord } from "@/types";
import { format, subMonths, parseISO } from "date-fns";

const Progress = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const navigate = useNavigate();
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    
    if (isAuthenticated && profile) {
      fetchWeightRecords();
    }
  }, [isAuthenticated, isLoading, profile, isInitialized]);

  const fetchWeightRecords = async () => {
    try {
      setIsLoadingData(true);
      
      // Get last 6 months of weight records
      const sixMonthsAgo = subMonths(new Date(), 6).toISOString();
      
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', profile?.id)
        .gte('recorded_at', sixMonthsAgo)
        .order('recorded_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching weight records:", error);
        return;
      }
      
      if (data) {
        setWeightRecords(data);
      }
    } catch (err) {
      console.error("Failed to fetch weight records:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const getFormattedChartData = () => {
    if (!weightRecords.length) return [];
    
    return weightRecords.map(record => ({
      date: format(parseISO(record.recorded_at), 'MMM dd'),
      weight: record.weight,
    }));
  };

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A1F2C] text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Progress Tracking</h1>
            <p className="text-gray-400 mt-1">Monitor your fitness journey</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Weight Progress</CardTitle>
                  <CardDescription className="text-gray-400">
                    Track your weight changes over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : weightRecords.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getFormattedChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip contentStyle={{ background: '#222', borderColor: '#444' }} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#ff2d2d" 
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center">
                      <p className="text-gray-400 mb-2">No weight records found</p>
                      <p className="text-sm text-gray-500">Start tracking your weight to see progress</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Stats Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <span className="text-gray-400">Current Weight</span>
                      <span className="font-semibold">
                        {weightRecords.length > 0 
                          ? `${weightRecords[weightRecords.length - 1].weight} lbs` 
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <span className="text-gray-400">Starting Weight</span>
                      <span className="font-semibold">
                        {weightRecords.length > 0 
                          ? `${weightRecords[0].weight} lbs` 
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <span className="text-gray-400">Weight Change</span>
                      <span className={`font-semibold ${getWeightChangeStyling()}`}>
                        {getWeightChange()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weigh-ins</span>
                      <span className="font-semibold">{weightRecords.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  function getWeightChange() {
    if (weightRecords.length < 2) return 'N/A';
    
    const firstWeight = weightRecords[0].weight;
    const currentWeight = weightRecords[weightRecords.length - 1].weight;
    const diff = currentWeight - firstWeight;
    
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)} lbs`;
  }
  
  function getWeightChangeStyling() {
    if (weightRecords.length < 2) return '';
    
    const firstWeight = weightRecords[0].weight;
    const currentWeight = weightRecords[weightRecords.length - 1].weight;
    const diff = currentWeight - firstWeight;
    
    return diff < 0 ? 'text-green-500' : diff > 0 ? 'text-red-500' : 'text-gray-400';
  }
};

export default Progress;
