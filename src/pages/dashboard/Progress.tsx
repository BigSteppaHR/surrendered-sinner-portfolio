
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { Calendar, ArrowUp, ArrowDown, TrendingUp, Activity, Dumbbell, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Progress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weightStats, setWeightStats] = useState({
    current: 0,
    change: 0,
    isPositive: false
  });
  const [strengthStats, setStrengthStats] = useState({
    squat: { current: 0, change: 0, isPositive: true },
    bench: { current: 0, change: 0, isPositive: true },
    deadlift: { current: 0, change: 0, isPositive: true }
  });
  
  useEffect(() => {
    if (!user) return;
    
    // Load progress data
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get latest weight record
        const { data: latestWeight, error: weightError } = await supabase
          .from('weight_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_approved', true)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();
          
        // Get weight from 30 days ago for comparison
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: oldWeightData, error: oldWeightError } = await supabase
          .from('weight_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_approved', true)
          .lt('recorded_at', thirtyDaysAgo.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();
          
        // Calculate weight change
        if (latestWeight) {
          const oldWeight = oldWeightData?.weight || latestWeight.weight;
          const weightChange = latestWeight.weight - oldWeight;
          
          setWeightStats({
            current: latestWeight.weight,
            change: Math.abs(weightChange),
            isPositive: weightChange > 0
          });
        }
        
        // Get latest strength records
        const exercises = ['squat', 'bench', 'deadlift'];
        const strengthStatsData = { ...strengthStats };
        
        for (const exercise of exercises) {
          // Get latest record
          const { data: latestRecord, error: recordError } = await supabase
            .from('performance_records')
            .select('*')
            .eq('user_id', user.id)
            .eq('exercise_type', exercise)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();
            
          // Get record from 30 days ago
          const { data: oldRecordData, error: oldRecordError } = await supabase
            .from('performance_records')
            .select('*')
            .eq('user_id', user.id)
            .eq('exercise_type', exercise)
            .lt('recorded_at', thirtyDaysAgo.toISOString())
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latestRecord) {
            const oldRecord = oldRecordData?.weight || latestRecord.weight;
            const strengthChange = latestRecord.weight - oldRecord;
            
            strengthStatsData[exercise as keyof typeof strengthStatsData] = {
              current: latestRecord.weight,
              change: Math.abs(strengthChange),
              isPositive: strengthChange > 0
            };
          }
        }
        
        setStrengthStats(strengthStatsData);
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Body Weight Stat */}
        <Card className="bg-[#111111] border-[#333333]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Current Weight</p>
                <h3 className="text-2xl font-bold mt-1">{weightStats.current} lbs</h3>
              </div>
              <div className="p-2 bg-sinner-red/10 text-sinner-red rounded-lg">
                <Heart className="h-5 w-5" />
              </div>
            </div>
            <div className={`flex items-center mt-4 text-sm ${!weightStats.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {!weightStats.isPositive ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : (
                <ArrowUp className="h-4 w-4 mr-1" />
              )}
              <span>{weightStats.change} lbs in 30 days</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Squat Stat */}
        <Card className="bg-[#111111] border-[#333333]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Squat Max</p>
                <h3 className="text-2xl font-bold mt-1">{strengthStats.squat.current} lbs</h3>
              </div>
              <div className="p-2 bg-sinner-red/10 text-sinner-red rounded-lg">
                <Dumbbell className="h-5 w-5" />
              </div>
            </div>
            <div className={`flex items-center mt-4 text-sm ${strengthStats.squat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {strengthStats.squat.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span>{strengthStats.squat.change} lbs in 30 days</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Bench Stat */}
        <Card className="bg-[#111111] border-[#333333]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Bench Max</p>
                <h3 className="text-2xl font-bold mt-1">{strengthStats.bench.current} lbs</h3>
              </div>
              <div className="p-2 bg-sinner-red/10 text-sinner-red rounded-lg">
                <Dumbbell className="h-5 w-5" />
              </div>
            </div>
            <div className={`flex items-center mt-4 text-sm ${strengthStats.bench.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {strengthStats.bench.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span>{strengthStats.bench.change} lbs in 30 days</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Deadlift Stat */}
        <Card className="bg-[#111111] border-[#333333]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Deadlift Max</p>
                <h3 className="text-2xl font-bold mt-1">{strengthStats.deadlift.current} lbs</h3>
              </div>
              <div className="p-2 bg-sinner-red/10 text-sinner-red rounded-lg">
                <Dumbbell className="h-5 w-5" />
              </div>
            </div>
            <div className={`flex items-center mt-4 text-sm ${strengthStats.deadlift.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {strengthStats.deadlift.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span>{strengthStats.deadlift.change} lbs in 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <PerformanceChart />
        
        <Card className="bg-[#111111] border-[#333333]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 text-sinner-red mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest logged workouts and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-sinner-red/10 text-sinner-red rounded-full mr-3">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">Weight Recorded</h4>
                    <span className="text-xs text-gray-400 ml-2">3 days ago</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    You recorded a weight of 185 lbs
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-sinner-red/10 text-sinner-red rounded-full mr-3">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">Strength Workout</h4>
                    <span className="text-xs text-gray-400 ml-2">5 days ago</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Bench Press: 3 sets × 5 reps × 225 lbs
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 bg-sinner-red/10 text-sinner-red rounded-full mr-3">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">New Personal Record</h4>
                    <span className="text-xs text-gray-400 ml-2">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    You set a new PR for Deadlift: 315 lbs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
