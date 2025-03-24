
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, ArrowUp, ArrowDown } from "lucide-react";

// Define the types for our lift records
interface LiftRecord {
  id: string;
  user_id: string;
  recorded_at: string;
  squat: number;
  bench: number;
  deadlift: number;
  bodyweight: number;
  notes?: string;
}

const Progress = () => {
  const [activeTab, setActiveTab] = useState("weights");
  const [liftRecords, setLiftRecords] = useState<LiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    squat: "",
    bench: "",
    deadlift: "",
    bodyweight: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchLiftRecords = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("lift_records")
          .select("*")
          .order("recorded_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Type assertion to ensure the data matches our LiftRecord type
          setLiftRecords(data as LiftRecord[]);
        }
      } catch (error: any) {
        console.error("Error fetching lift records:", error.message);
        toast({
          title: "Failed to load lift records",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiftRecords();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert form values to numbers
      const numericFormData = {
        squat: parseFloat(formData.squat) || 0,
        bench: parseFloat(formData.bench) || 0,
        deadlift: parseFloat(formData.deadlift) || 0,
        bodyweight: parseFloat(formData.bodyweight) || 0,
        notes: formData.notes.trim(),
        recorded_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("lift_records")
        .insert([numericFormData])
        .select();
        
      if (error) throw error;
      
      // Only update the state if we have valid data
      if (data && data.length > 0) {
        setLiftRecords([data[0] as LiftRecord, ...liftRecords]);
        
        // Reset the form
        setFormData({
          squat: "",
          bench: "",
          deadlift: "",
          bodyweight: "",
          notes: ""
        });
        
        toast({
          title: "Record added successfully",
          description: "Your lift record has been saved.",
        });
      }
    } catch (error: any) {
      console.error("Error adding lift record:", error.message);
      toast({
        title: "Failed to add record",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getChartData = () => {
    // Sort records by date for chart display (oldest to newest)
    const sortedRecords = [...liftRecords].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    
    return sortedRecords.map(record => ({
      date: new Date(record.recorded_at).toLocaleDateString(),
      Squat: record.squat,
      Bench: record.bench,
      Deadlift: record.deadlift,
      Bodyweight: record.bodyweight
    }));
  };

  const calculateProgress = (exercise: keyof LiftRecord) => {
    if (liftRecords.length < 2) return { value: 0, isPositive: true };
    
    // Get the two most recent records
    const current = liftRecords[0][exercise];
    const previous = liftRecords[1][exercise];
    
    if (typeof current === 'number' && typeof previous === 'number') {
      const diff = current - previous;
      return {
        value: Math.abs(diff),
        isPositive: diff >= 0
      };
    }
    
    return { value: 0, isPositive: true };
  };

  const squatProgress = calculateProgress('squat');
  const benchProgress = calculateProgress('bench');
  const deadliftProgress = calculateProgress('deadlift');
  const bodyweightProgress = calculateProgress('bodyweight');

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Progress Tracking</h1>
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-[#232634] w-full sm:w-auto">
          <TabsTrigger value="weights" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span>Strength Progression</span>
          </TabsTrigger>
          <TabsTrigger value="measurements" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Squat</span>
                  {squatProgress.value > 0 && (
                    <span className={`text-sm ${squatProgress.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                      {squatProgress.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {squatProgress.value} lbs
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">Latest max</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {liftRecords.length > 0 ? `${liftRecords[0].squat} lbs` : "No data"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Bench</span>
                  {benchProgress.value > 0 && (
                    <span className={`text-sm ${benchProgress.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                      {benchProgress.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {benchProgress.value} lbs
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">Latest max</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {liftRecords.length > 0 ? `${liftRecords[0].bench} lbs` : "No data"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Deadlift</span>
                  {deadliftProgress.value > 0 && (
                    <span className={`text-sm ${deadliftProgress.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                      {deadliftProgress.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {deadliftProgress.value} lbs
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">Latest max</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {liftRecords.length > 0 ? `${liftRecords[0].deadlift} lbs` : "No data"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Bodyweight</span>
                  {bodyweightProgress.value > 0 && (
                    <span className={`text-sm ${bodyweightProgress.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                      {bodyweightProgress.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {bodyweightProgress.value} lbs
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">Current</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {liftRecords.length > 0 ? `${liftRecords[0].bodyweight} lbs` : "No data"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Strength Progress Chart</CardTitle>
              <CardDescription>View your progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px]">
                {liftRecords.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: 'none' }} />
                      <Legend />
                      <Line type="monotone" dataKey="Squat" stroke="#9b87f5" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Bench" stroke="#f5a287" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Deadlift" stroke="#87f5e0" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Bodyweight" stroke="#f587e8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available. Add your lift records to see the chart.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add New Record</CardTitle>
              <CardDescription>Log your latest lift numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="squat">Squat (lbs)</Label>
                    <Input
                      id="squat"
                      name="squat"
                      type="number"
                      placeholder="Enter weight"
                      value={formData.squat}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bench">Bench Press (lbs)</Label>
                    <Input
                      id="bench"
                      name="bench"
                      type="number"
                      placeholder="Enter weight"
                      value={formData.bench}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadlift">Deadlift (lbs)</Label>
                    <Input
                      id="deadlift"
                      name="deadlift"
                      type="number"
                      placeholder="Enter weight"
                      value={formData.deadlift}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bodyweight">Bodyweight (lbs)</Label>
                    <Input
                      id="bodyweight"
                      name="bodyweight"
                      type="number"
                      placeholder="Enter weight"
                      value={formData.bodyweight}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Add any notes about your lifts"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
                
                <Button type="submit" className="bg-[#9b87f5] hover:bg-[#8a74f5]">
                  Save Record
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="measurements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lift History</CardTitle>
              <CardDescription>View your recorded lifts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-[#9b87f5] border-t-transparent rounded-full"></div>
                </div>
              ) : liftRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#333]">
                        <th className="py-3 text-left">Date</th>
                        <th className="py-3 text-left">Squat (lbs)</th>
                        <th className="py-3 text-left">Bench (lbs)</th>
                        <th className="py-3 text-left">Deadlift (lbs)</th>
                        <th className="py-3 text-left">Bodyweight (lbs)</th>
                        <th className="py-3 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liftRecords.map((record) => (
                        <tr key={record.id} className="border-b border-[#333] hover:bg-[#232634]">
                          <td className="py-3">{new Date(record.recorded_at).toLocaleDateString()}</td>
                          <td className="py-3">{record.squat}</td>
                          <td className="py-3">{record.bench}</td>
                          <td className="py-3">{record.deadlift}</td>
                          <td className="py-3">{record.bodyweight}</td>
                          <td className="py-3">{record.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No lift records available. Start adding your lifts to track progress.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Progress;
