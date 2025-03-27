
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const WeightTracker = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [weightRecords, setWeightRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [goalProgress, setGoalProgress] = useState(40);
  
  // Placeholder for future database calls
  useEffect(() => {
    // This is where we'll fetch weight records from the database
    // For now using static data
    setWeightRecords([
      { date: 'Apr 15, 2023', weight: '175' },
      { date: 'Apr 8, 2023', weight: '176.5' },
      { date: 'Apr 1, 2023', weight: '178' },
      { date: 'Mar 25, 2023', weight: '180' }
    ]);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // For now we'll just update the UI
      // In the future, we'll save to the database
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const newRecord = {
        date: formattedDate,
        weight: weight
      };
      
      setWeightRecords([newRecord, ...weightRecords.slice(0, 3)]);
      
      // Clear form
      setWeight("");
      
      toast({
        title: "Weight recorded",
        description: "Your weight has been saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving weight:", error);
      toast({
        title: "Error",
        description: "Failed to save your weight record",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Current Goal</h3>
            <p className="text-sm text-muted-foreground">Lose 10 lbs by June 30</p>
          </div>
          <div className="text-2xl font-bold text-[#ea384c]">{goalProgress}%</div>
        </div>
        <Progress value={goalProgress} className="h-2" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Record Today's Weight</Label>
          <div className="flex space-x-2">
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Weight in lbs"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              disabled={isSaving}
            />
            <Button 
              type="submit" 
              className="bg-[#ea384c] hover:bg-red-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving
                </>
              ) : "Save"}
            </Button>
          </div>
        </div>
      </form>

      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#ea384c]" />
            </div>
          ) : (
            <div className="space-y-2">
              {weightRecords.map((record, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between items-center ${
                    index < weightRecords.length - 1 ? 'border-b border-zinc-700 pb-2' : ''
                  }`}
                >
                  <span className="text-sm">{record.date}</span>
                  <span className="font-medium">{record.weight} lbs</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightTracker;
