
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { WeightRecord } from "@/types";
import { format, subMonths, parseISO, addWeeks, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Progress = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleSubmitWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) return;
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert({
          user_id: profile.id,
          weight: weightValue,
          notes: notes || null,
          recorded_at: new Date().toISOString()
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Weight record added",
        description: "Your weight record has been successfully added"
      });
      
      setWeight("");
      setNotes("");
      
      // Refresh weight records
      fetchWeightRecords();
      
    } catch (error: any) {
      toast({
        title: "Error adding weight record",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedChartData = () => {
    if (!weightRecords.length) {
      // Create empty data points for the last 6 weeks
      const emptyData = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = addWeeks(today, -i);
        emptyData.push({
          date: format(date, 'MMM dd'),
          weight: 0
        });
      }
      return emptyData;
    }
    
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
                  ) : (
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
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 mt-6">
                <CardHeader>
                  <CardTitle>Submit Weight Update</CardTitle>
                  <CardDescription className="text-gray-400">
                    Record your current weight to track progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitWeight} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Current Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Enter your weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes about this weigh-in"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-gray-800 border-gray-700 min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#9b87f5] hover:bg-[#8a76e4]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                          Submitting...
                        </span>
                      ) : "Submit Weight Record"}
                    </Button>
                  </form>
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
                          : 'No data'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pb-2 border-b border-gray-800">
                      <span className="text-gray-400">Starting Weight</span>
                      <span className="font-semibold">
                        {weightRecords.length > 0 
                          ? `${weightRecords[0].weight} lbs` 
                          : 'No data'}
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

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your fitness milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weightRecords.length > 0 ? (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-[#9b87f5]/20 flex items-center">
                        <div className="bg-[#9b87f5] p-2 rounded-full mr-3">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">First Weigh-in</p>
                          <p className="text-xs text-gray-400">Started tracking your progress</p>
                        </div>
                      </div>
                      
                      {weightRecords.length >= 5 && (
                        <div className="p-3 rounded-lg bg-[#9b87f5]/20 flex items-center">
                          <div className="bg-[#9b87f5] p-2 rounded-full mr-3">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Consistent Tracker</p>
                            <p className="text-xs text-gray-400">5+ weight entries recorded</p>
                          </div>
                        </div>
                      )}
                      
                      {getWeightChange() !== 'N/A' && 
                       parseFloat(getWeightChange().replace(/[^\d.-]/g, '')) < 0 && (
                        <div className="p-3 rounded-lg bg-green-500/20 flex items-center">
                          <div className="bg-green-500 p-2 rounded-full mr-3">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Weight Loss Achievement</p>
                            <p className="text-xs text-gray-400">Successfully lost weight</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400">No achievements yet</p>
                      <p className="text-sm text-gray-500 mt-1">Record your weight to unlock achievements</p>
                    </div>
                  )}
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
