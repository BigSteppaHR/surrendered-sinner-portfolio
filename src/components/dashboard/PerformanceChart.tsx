
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, TrendingDown, Info, Eye, Dumbbell, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StrengthRecord = {
  id: string;
  user_id: string;
  exercise_type: string;
  weight: number;
  reps: number;
  recorded_at: string;
  created_at: string;
  notes?: string;
};

type WeightRecord = {
  id: string;
  user_id: string;
  weight: number;
  recorded_at: string;
  created_at: string;
  is_approved: boolean;
  image_url?: string;
  notes?: string;
};

const PerformanceChart = () => {
  const { user } = useAuth();
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [strengthRecords, setStrengthRecords] = useState<StrengthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedRecord, setSelectedRecord] = useState<WeightRecord | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("fitness");
  const [exerciseType, setExerciseType] = useState<string>("squat");

  // Load weight data
  useEffect(() => {
    if (!user) return;

    const fetchWeightRecords = async () => {
      setIsLoading(true);

      try {
        // Set date range based on selection
        const now = new Date();
        let startDate = new Date();
        
        if (range === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (range === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (range === 'year') {
          startDate.setFullYear(now.getFullYear() - 1);
        }

        // Fetch approved weight records within date range
        const { data: weightData, error: weightError } = await supabase
          .from('weight_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_approved', true)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (weightError) throw weightError;
        
        // Fetch strength records within date range
        const { data: strengthData, error: strengthError } = await supabase
          .from('performance_records')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_at', startDate.toISOString())
          .order('recorded_at', { ascending: true });

        if (strengthError) throw strengthError;

        setWeightRecords(weightData || []);
        setStrengthRecords(strengthData || []);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeightRecords();
  }, [user, range, activeTab]);

  // Format fitness chart data
  const fitnessChartData = weightRecords.map(record => ({
    date: new Date(record.recorded_at).toLocaleDateString(),
    weight: record.weight,
    id: record.id,
  }));

  // Format strength chart data
  const filteredStrengthRecords = strengthRecords.filter(
    record => record.exercise_type === exerciseType
  );

  const strengthChartData = filteredStrengthRecords.map(record => ({
    date: new Date(record.recorded_at).toLocaleDateString(),
    weight: record.weight,
    reps: record.reps,
    id: record.id,
  }));

  // Calculate weight change
  const calculateWeightChange = () => {
    if (weightRecords.length < 2) return { value: 0, isPositive: false };

    const latest = weightRecords[weightRecords.length - 1]?.weight || 0;
    const earliest = weightRecords[0]?.weight || 0;
    const change = latest - earliest;

    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
    };
  };

  // Calculate strength change
  const calculateStrengthChange = () => {
    if (filteredStrengthRecords.length < 2) return { value: 0, isPositive: false };

    const latest = filteredStrengthRecords[filteredStrengthRecords.length - 1]?.weight || 0;
    const earliest = filteredStrengthRecords[0]?.weight || 0;
    const change = latest - earliest;

    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
    };
  };

  const fitnessChange = calculateWeightChange();
  const strengthChange = calculateStrengthChange();

  // View record image
  const handleViewImage = (record: WeightRecord) => {
    if (record.image_url) {
      setSelectedRecord(record);
      setShowImageDialog(true);
    }
  };

  // Close image dialog
  const handleCloseDialog = () => {
    setShowImageDialog(false);
    setSelectedRecord(null);
  };

  // Custom tooltip for fitness chart
  const FitnessTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const record = weightRecords.find(r => new Date(r.recorded_at).toLocaleDateString() === label);
      
      return (
        <div className="bg-gray-900 border border-gray-800 p-2 rounded shadow-md text-sm">
          <p className="font-semibold">{label}</p>
          <p>Weight: {payload[0].value} lbs</p>
          {record?.image_url && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-sinner-red text-xs mt-1"
              onClick={() => record && handleViewImage(record)}
            >
              <Eye className="h-3 w-3 mr-1" /> View photo
            </Button>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for strength chart
  const StrengthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-2 rounded shadow-md text-sm">
          <p className="font-semibold">{label}</p>
          <p>Weight: {payload[0].value} lbs</p>
          <p>Reps: {payload[0].payload.reps}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 text-sinner-red mr-2" />
                Performance Progress
              </CardTitle>
              <CardDescription>Track your fitness journey over time</CardDescription>
            </div>
            
            <div className="flex space-x-1">
              <Button 
                variant={range === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRange('week')}
                className="h-7 text-xs bg-sinner-red hover:bg-red-700"
              >
                Week
              </Button>
              <Button 
                variant={range === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRange('month')}
                className="h-7 text-xs bg-sinner-red hover:bg-red-700"
              >
                Month
              </Button>
              <Button 
                variant={range === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRange('year')}
                className="h-7 text-xs bg-sinner-red hover:bg-red-700"
              >
                Year
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs 
            defaultValue="fitness" 
            className="w-full" 
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="mb-4 grid grid-cols-2 w-full">
              <TabsTrigger 
                value="fitness" 
                className="data-[state=active]:bg-sinner-red data-[state=active]:text-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                Body Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="strength" 
                className="data-[state=active]:bg-sinner-red data-[state=active]:text-white"
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Strength Metrics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="fitness">
              {isLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-sinner-red border-t-transparent rounded-full"></div>
                </div>
              ) : weightRecords.length >= 2 ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge 
                      variant="outline" 
                      className={`py-1.5 px-2.5 ${
                        !fitnessChange.isPositive ? 'bg-green-950/30 text-green-400 border-green-800' : 'bg-red-950/30 text-red-400 border-red-800'
                      }`}
                    >
                      {!fitnessChange.isPositive ? (
                        <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      )}
                      {fitnessChange.value} lbs
                    </Badge>
                    
                    <div className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {new Date(weightRecords[0].recorded_at).toLocaleDateString()} — 
                        {new Date(weightRecords[weightRecords.length - 1].recorded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-60 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={fitnessChartData}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ea384c" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ea384c" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9ca3af" 
                          fontSize={10}
                          tickMargin={5}
                        />
                        <YAxis 
                          stroke="#9ca3af" 
                          fontSize={10} 
                          tickMargin={5}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip content={<FitnessTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#ea384c" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#weightGradient)"
                          activeDot={{ 
                            r: 6, 
                            fill: "#ea384c", 
                            stroke: "#fff", 
                            strokeWidth: 1,
                            onClick: (data: any) => {
                              const record = weightRecords.find(r => r.id === data.payload.id);
                              if (record?.image_url) handleViewImage(record);
                            }
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-center p-6">
                  <Info className="h-8 w-8 text-gray-500 mb-2" />
                  <h3 className="text-lg font-medium mb-1">Not enough fitness data</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {weightRecords.length === 0
                      ? "You haven't recorded any weight entries yet."
                      : "You need at least two weight records to see a chart."}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submit weight records regularly to track your progress over time
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="strength">
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={exerciseType === 'squat' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setExerciseType('squat')}
                    className={exerciseType === 'squat' ? 'bg-sinner-red hover:bg-red-700' : ''}
                  >
                    Squat
                  </Button>
                  <Button 
                    variant={exerciseType === 'bench' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setExerciseType('bench')}
                    className={exerciseType === 'bench' ? 'bg-sinner-red hover:bg-red-700' : ''}
                  >
                    Bench
                  </Button>
                  <Button 
                    variant={exerciseType === 'deadlift' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setExerciseType('deadlift')}
                    className={exerciseType === 'deadlift' ? 'bg-sinner-red hover:bg-red-700' : ''}
                  >
                    Deadlift
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-sinner-red border-t-transparent rounded-full"></div>
                </div>
              ) : filteredStrengthRecords.length >= 2 ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge 
                      variant="outline" 
                      className={`py-1.5 px-2.5 ${
                        strengthChange.isPositive ? 'bg-green-950/30 text-green-400 border-green-800' : 'bg-red-950/30 text-red-400 border-red-800'
                      }`}
                    >
                      {strengthChange.isPositive ? (
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      )}
                      {strengthChange.value} lbs
                    </Badge>
                    
                    <div className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {new Date(filteredStrengthRecords[0].recorded_at).toLocaleDateString()} — 
                        {new Date(filteredStrengthRecords[filteredStrengthRecords.length - 1].recorded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-60 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={strengthChartData}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9ca3af" 
                          fontSize={10}
                          tickMargin={5}
                        />
                        <YAxis 
                          stroke="#9ca3af" 
                          fontSize={10} 
                          tickMargin={5}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip content={<StrengthTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#ea384c" 
                          strokeWidth={2}
                          dot={{
                            r: 5,
                            fill: "#ea384c",
                          }}
                          activeDot={{ 
                            r: 7, 
                            fill: "#ea384c", 
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-center p-6">
                  <Info className="h-8 w-8 text-gray-500 mb-2" />
                  <h3 className="text-lg font-medium mb-1">Not enough strength data</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {filteredStrengthRecords.length === 0
                      ? `You haven't recorded any ${exerciseType} exercises yet.`
                      : "You need at least two entries to see a chart."}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submit strength records regularly to track your progress over time
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Progress Photo</DialogTitle>
            <DialogDescription>
              Recorded on {selectedRecord && new Date(selectedRecord.recorded_at).toLocaleDateString()} • {selectedRecord?.weight} lbs
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord?.image_url && (
            <div className="relative aspect-square w-full rounded-md overflow-hidden border border-gray-700">
              <img 
                src={selectedRecord.image_url} 
                alt="Progress" 
                className="object-contain w-full h-full"
              />
            </div>
          )}
          
          {selectedRecord?.notes && (
            <div className="px-3 py-2 bg-gray-800/50 rounded-md text-sm">
              <p className="text-xs text-gray-400 mb-1">Notes:</p>
              <p>{selectedRecord.notes}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PerformanceChart;
