import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { WeightRecord } from '@/types';

const WeightChart = () => {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getWeightChange = () => {
    if (weightRecords.length < 2) return { value: 0, isPositive: false };
    
    const sortedRecords = [...weightRecords].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    
    const first = sortedRecords[0].weight;
    const last = sortedRecords[sortedRecords.length - 1].weight;
    const change = last - first;
    
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    };
  };

  const formatChartData = () => {
    return weightRecords
      .filter(record => record.is_approved)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map(record => ({
        date: new Date(record.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: record.weight
      }));
  };

  const fetchWeightRecords = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true });
        
      if (error) throw error;
      
      setWeightRecords(data || []);
    } catch (error) {
      console.error('Error fetching weight records:', error);
      toast({
        title: "Failed to load weight data",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const newRecord = {
        user_id: user.id,
        weight: parseFloat(weight),
        notes: notes || null,
        recorded_at: new Date().toISOString().split('T')[0]
      };
      
      const { data, error } = await supabase
        .from('weight_records')
        .insert([newRecord])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Weight submitted",
        description: "Your weight has been recorded and sent for approval",
      });
      
      setWeightRecords([...weightRecords, data]);
      setWeight('');
      setNotes('');
    } catch (error) {
      console.error('Error submitting weight:', error);
      toast({
        title: "Failed to submit weight",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWeightRecords();
    }
  }, [user]);

  const weightChange = getWeightChange();
  const chartData = formatChartData();

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Weight Progress</span>
          {weightRecords.length > 1 && (
            <div className={`flex items-center text-sm ${weightChange.isPositive ? 'text-red-500' : 'text-green-500'}`}>
              {weightChange.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span>{weightChange.value} lbs</span>
            </div>
          )}
        </CardTitle>
        <CardDescription className="text-gray-400">Track your weight progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">
            No weight data available yet
          </div>
        )}

        <form onSubmit={handleSubmitWeight} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="weight">Add Today's Weight (lbs)</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <Button type="submit" disabled={submitting || !weight}>
                {submitting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about today's weight..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 bg-gray-800 border-gray-700"
              rows={2}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeightChart;
