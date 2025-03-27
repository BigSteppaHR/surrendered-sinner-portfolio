import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const WeightTracker = () => {
  const [weight, setWeight] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Weight submitted:", weight);
    // Reset form
    setWeight("");
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Current Goal</h3>
            <p className="text-sm text-muted-foreground">Lose 10 lbs by June 30</p>
          </div>
          <div className="text-2xl font-bold text-[#ea384c]">40%</div>
        </div>
        <Progress value={40} className="h-2" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Record Today's Weight</Label>
          <div className="flex space-x-2">
            <Input
              id="weight"
              type="number"
              placeholder="Weight in lbs"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
            <Button 
              type="submit" 
              className="bg-[#ea384c] hover:bg-red-700"
            >
              Save
            </Button>
          </div>
        </div>
      </form>

      <Card className="bg-zinc-800 border-zinc-700">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
              <span className="text-sm">Apr 15, 2023</span>
              <span className="font-medium">175 lbs</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
              <span className="text-sm">Apr 8, 2023</span>
              <span className="font-medium">176.5 lbs</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
              <span className="text-sm">Apr 1, 2023</span>
              <span className="font-medium">178 lbs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mar 25, 2023</span>
              <span className="font-medium">180 lbs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightTracker;
