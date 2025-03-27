import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { UploadCloud, BarChart2, Activity, LineChart, Calendar } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

const Progress = () => {
  const { profile } = useAuth();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [progressPhoto, setProgressPhoto] = useState<File | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Weight:', weight);
    console.log('Body Fat:', bodyFat);
    console.log('Progress Photo:', progressPhoto);
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProgressPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A1F2C] text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Track Your Progress</h1>
          
          <Tabs defaultValue="measurements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="photos">Progress Photos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="measurements">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Update Measurements</CardTitle>
                  <CardDescription className="text-gray-400">
                    Keep track of your weight and body fat percentage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        type="number"
                        id="weight"
                        placeholder="Enter your weight"
                        className="bg-gray-800 border-gray-700"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="body-fat">Body Fat (%)</Label>
                      <Input
                        type="number"
                        id="body-fat"
                        placeholder="Enter your body fat percentage"
                        className="bg-gray-800 border-gray-700"
                        value={bodyFat}
                        onChange={(e) => setBodyFat(e.target.value)}
                      />
                    </div>
                    
                    <Button className="w-full bg-sinner-red hover:bg-red-700">
                      Update Progress
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="photos">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Upload Progress Photo</CardTitle>
                  <CardDescription className="text-gray-400">
                    Visualize your journey by uploading progress photos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="progress-photo">
                        Progress Photo
                      </Label>
                      <Input
                        type="file"
                        id="progress-photo"
                        className="bg-gray-800 border-gray-700 file:bg-gray-700 file:border-0 file:text-white file:h-10"
                        onChange={handlePhotoChange}
                      />
                    </div>
                    
                    <Button className="w-full bg-sinner-red hover:bg-red-700">
                      Upload Photo
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Your Progress Charts</h2>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Weight Chart</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your weight over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart2 className="h-8 w-8 text-gray-500 mx-auto" />
                <p className="text-center text-gray-400">No data available yet.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 mt-6">
              <CardHeader>
                <CardTitle>Body Fat Chart</CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor your body fat percentage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart className="h-8 w-8 text-gray-500 mx-auto" />
                <p className="text-center text-gray-400">No data available yet.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
