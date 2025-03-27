
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { UploadCloud, BarChart2, Activity, LineChart, Calendar, Dumbbell, AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface WeightRecord {
  id: string;
  weight: number;
  recorded_at: string;
  notes?: string;
  image_url?: string;
}

interface BodyFatRecord {
  id: string;
  percentage: number;
  recorded_at: string;
}

const Progress = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [progressPhoto, setProgressPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [bodyFatHistory, setBodyFatHistory] = useState<BodyFatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      
      setWeightHistory(weightData || []);
      
      // In a real app, you would fetch body fat records from a separate table
      // For now, we'll mock this data
      setBodyFatHistory([]);
      
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
  
  const handleSubmitWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!weight) {
      toast({
        title: 'Input Required',
        description: 'Please enter your weight',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const weightValue = parseFloat(weight);
      
      const { data, error } = await supabase
        .from('weight_records')
        .insert({
          user_id: user.id,
          weight: weightValue,
          notes: `Manual entry: ${weightValue} lbs`,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Weight Updated',
        description: 'Your weight has been recorded successfully',
      });
      
      setWeight('');
      fetchProgressData();
      
    } catch (error) {
      console.error('Error recording weight:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem recording your weight',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitBodyFat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bodyFat) {
      toast({
        title: 'Input Required',
        description: 'Please enter your body fat percentage',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, you would store this in the database
    // For now we'll just show a toast
    toast({
      title: 'Body Fat Updated',
      description: 'Your body fat percentage has been recorded',
    });
    
    setBodyFat('');
  };
  
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !progressPhoto) return;
    
    setIsUploading(true);
    
    try {
      // Create a unique file path
      const filePath = `progress_photos/${user.id}/${Date.now()}_${progressPhoto.name}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, progressPhoto);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('user_uploads')
        .getPublicUrl(filePath);
        
      // Create a record in the weight_records table
      await supabase
        .from('weight_records')
        .insert({
          user_id: user.id,
          weight: 0, // placeholder value
          notes: 'Progress photo upload',
          image_url: urlData.publicUrl,
          recorded_at: new Date().toISOString(),
        });
      
      toast({
        title: 'Photo Uploaded',
        description: 'Your progress photo has been uploaded successfully',
      });
      
      setProgressPhoto(null);
      fetchProgressData();
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was a problem uploading your photo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProgressPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Track Your Progress</h1>
          
          <Tabs defaultValue="measurements" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a]">
              <TabsTrigger value="measurements" className="data-[state=active]:bg-[#ea384c]">Measurements</TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:bg-[#ea384c]">Progress Photos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="measurements">
              <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
                <CardHeader>
                  <CardTitle>Update Measurements</CardTitle>
                  <CardDescription className="text-gray-400">
                    Keep track of your weight and body fat percentage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form onSubmit={handleSubmitWeight} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          type="number"
                          id="weight"
                          placeholder="Enter your weight"
                          className="bg-[#1a1a1a] border-[#333]"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-[#ea384c] hover:bg-red-700"
                        disabled={isSubmitting}
                        type="submit"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            Updating...
                          </>
                        ) : (
                          'Update Weight'
                        )}
                      </Button>
                    </form>
                    
                    <form onSubmit={handleSubmitBodyFat} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="body-fat">Body Fat (%)</Label>
                        <Input
                          type="number"
                          id="body-fat"
                          placeholder="Enter your body fat percentage"
                          className="bg-[#1a1a1a] border-[#333]"
                          value={bodyFat}
                          onChange={(e) => setBodyFat(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-[#ea384c] hover:bg-red-700"
                        type="submit"
                      >
                        Update Body Fat
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Dumbbell className="h-5 w-5 text-[#ea384c] mr-2" />
                      Weight History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
                      </div>
                    ) : weightHistory.length > 0 ? (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {weightHistory.map((record) => (
                          <div key={record.id} className="p-3 bg-[#1a1a1a] rounded-md border border-[#333]">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-xl font-bold">{record.weight} lbs</span>
                                <p className="text-sm text-gray-400">
                                  {format(new Date(record.recorded_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                              {record.image_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#ea384c]"
                                  onClick={() => window.open(record.image_url, '_blank')}
                                >
                                  View Photo
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                        <p>No weight records yet</p>
                        <p className="text-sm">Start tracking your progress</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 text-[#ea384c] mr-2" />
                      Body Fat History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-gray-400">
                      <LineChart className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                      <p>No body fat records yet</p>
                      <p className="text-sm">Start tracking your progress</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="photos">
              <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
                <CardHeader>
                  <CardTitle>Upload Progress Photo</CardTitle>
                  <CardDescription className="text-gray-400">
                    Visualize your journey by uploading progress photos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePhotoUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="progress-photo">
                        Progress Photo
                      </Label>
                      <Input
                        type="file"
                        id="progress-photo"
                        className="bg-[#1a1a1a] border-[#333] file:bg-[#333] file:border-0 file:text-white file:h-10"
                        onChange={handlePhotoChange}
                        accept="image/*"
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-[#ea384c] hover:bg-red-700"
                      disabled={!progressPhoto || isUploading}
                      type="submit"
                    >
                      {isUploading ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </form>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Your Progress Photos</h3>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {weightHistory
                          .filter(record => record.image_url)
                          .map((record) => (
                            <div 
                              key={record.id} 
                              className="aspect-square rounded-md overflow-hidden border border-[#333] relative group"
                            >
                              {record.image_url && (
                                <>
                                  <img 
                                    src={record.image_url} 
                                    alt={`Progress photo from ${format(new Date(record.recorded_at), 'MMM d, yyyy')}`}
                                    className="object-cover w-full h-full"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <p className="text-sm text-center text-white">
                                      {format(new Date(record.recorded_at), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                          
                        {weightHistory.filter(record => record.image_url).length === 0 && (
                          <div className="col-span-full text-center py-6 text-gray-400">
                            <p>No progress photos uploaded yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card className="bg-[#0f0f0f] border-[#1a1a1a] mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-[#ea384c] mr-2" />
                Progress Tracking Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ea384c] mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Take measurements at the same time of day for consistency</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ea384c] mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>When taking progress photos, use consistent lighting and poses</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ea384c] mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Weight fluctuations are normal - focus on weekly trends</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ea384c] mt-1.5 mr-2 flex-shrink-0"></span>
                  <span>Track your performance in the gym alongside your body measurements</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;
