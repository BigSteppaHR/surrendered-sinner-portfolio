
import React, { useState, useEffect } from 'react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, ChevronDown, FileUpload, BarChart, TrendingUp, Award, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressRecord {
  id: string;
  recorded_at: string;
  weight: number;
  notes?: string;
}

const Progress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('weight');
  const [weightRecords, setWeightRecords] = useState<ProgressRecord[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightNotes, setNewWeightNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    setIsLoading(true);
    try {
      // Fetch weight records
      const { data: weightData, error: weightError } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('recorded_at', { ascending: false });
      
      if (weightError) throw weightError;
      
      // Fetch performance records
      const { data: performanceData, error: performanceError } = await supabase
        .from('performance_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('recorded_at', { ascending: false });
      
      if (performanceError) throw performanceError;
      
      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievements:achievement_id (
            id,
            name,
            description,
            points,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });
      
      if (achievementsError) throw achievementsError;
      
      setWeightRecords(weightData || []);
      setPerformanceRecords(performanceData || []);
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your progress data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid weight',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert({
          user_id: user?.id,
          weight: parseFloat(newWeight),
          notes: newWeightNotes || null,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setWeightRecords([data, ...weightRecords]);
      setNewWeight('');
      setNewWeightNotes('');
      
      toast({
        title: 'Weight Recorded',
        description: 'Your new weight record has been saved',
      });
    } catch (error) {
      console.error('Error adding weight record:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your weight record',
        variant: 'destructive',
      });
    }
  };

  // Prepare data for weight chart
  const chartData = [...weightRecords]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map(record => ({
      date: new Date(record.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: record.weight
    }));

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
            <p className="text-gray-400">Track and visualize your fitness journey</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-zinc-900 border-zinc-800 p-1">
              <TabsTrigger value="weight" className="data-[state=active]:bg-sinner-red data-[state=active]:text-white">
                Weight Tracking
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-sinner-red data-[state=active]:text-white">
                Performance
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-sinner-red data-[state=active]:text-white">
                Achievements
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weight" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-sinner-red mr-2" />
                      Add Weight Record
                    </CardTitle>
                    <CardDescription>Track your weight progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        placeholder="Enter your weight"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Input
                        id="notes"
                        value={newWeightNotes}
                        onChange={(e) => setNewWeightNotes(e.target.value)}
                        placeholder="Any additional notes"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleAddWeight}
                      className="w-full bg-sinner-red hover:bg-red-700"
                    >
                      Add Weight Record
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900 border-zinc-800 col-span-1 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart className="h-5 w-5 text-sinner-red mr-2" />
                      Weight Progress
                    </CardTitle>
                    <CardDescription>Visualize your weight journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="weight" 
                              stroke="#ea384c" 
                              strokeWidth={2}
                              dot={{ stroke: '#ea384c', strokeWidth: 2, r: 4 }}
                              activeDot={{ stroke: '#ea384c', strokeWidth: 2, r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <p>No weight records available yet</p>
                        <p className="text-sm mt-2">Add your first weight record to see your progress</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-sinner-red mr-2" />
                    Weight History
                  </CardTitle>
                  <CardDescription>View all your weight records</CardDescription>
                </CardHeader>
                <CardContent>
                  {weightRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Weight (lbs)</th>
                            <th className="text-left py-3 px-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weightRecords.map((record) => (
                            <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                              <td className="py-3 px-4">
                                {new Date(record.recorded_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-3 px-4">{record.weight}</td>
                              <td className="py-3 px-4">{record.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p>No weight records available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dumbbell className="h-5 w-5 text-sinner-red mr-2" />
                    Performance Records
                  </CardTitle>
                  <CardDescription>Track your exercise performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Exercise</th>
                            <th className="text-left py-3 px-4">Weight</th>
                            <th className="text-left py-3 px-4">Reps</th>
                            <th className="text-left py-3 px-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performanceRecords.map((record) => (
                            <tr key={record.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                              <td className="py-3 px-4">
                                {new Date(record.recorded_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-3 px-4">{record.exercise_type}</td>
                              <td className="py-3 px-4">{record.weight}</td>
                              <td className="py-3 px-4">{record.reps}</td>
                              <td className="py-3 px-4">{record.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p>No performance records available yet</p>
                      <Button className="mt-4 bg-sinner-red hover:bg-red-700">
                        Add First Record
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 text-sinner-red mr-2" />
                    Your Achievements
                  </CardTitle>
                  <CardDescription>Celebrate your fitness milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-sinner-red/20 rounded-full flex items-center justify-center mr-3">
                              <Award className="h-5 w-5 text-sinner-red" />
                            </div>
                            <div>
                              <h3 className="font-medium">{achievement.achievements?.name || 'Achievement'}</h3>
                              <Badge className="bg-sinner-red/20 text-sinner-red border-sinner-red/20 mt-1">
                                {achievement.achievements?.points || 0} pts
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            {achievement.achievements?.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Earned: {new Date(achievement.earned_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p>No achievements earned yet</p>
                      <p className="text-sm mt-2">Keep working hard to earn your first achievement!</p>
                    </div>
                  )}
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
