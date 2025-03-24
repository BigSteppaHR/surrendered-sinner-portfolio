
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Scale, Info, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WeightRecord } from '@/types';

const weightRecordSchema = z.object({
  weight: z.coerce.number().positive({ message: "Weight must be a positive number" }),
  notes: z.string().optional(),
  image: z.instanceof(FileList).optional().transform(file => file && file.length > 0 ? file[0] : undefined),
});

type WeightFormValues = z.infer<typeof weightRecordSchema>;

const WeightTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);
  const [canSubmit, setCanSubmit] = useState(true);

  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightRecordSchema),
    defaultValues: {
      weight: undefined,
      notes: '',
    },
  });

  // Load weight records
  useEffect(() => {
    if (!user) return;
    
    const loadWeightRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('weight_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false });
          
        if (error) throw error;
        
        setRecords(data || []);
        
        // Check if user can submit today (max once per week)
        if (data && data.length > 0) {
          const latestRecord = new Date(data[0].recorded_at);
          setLastSubmission(latestRecord);
          
          const today = new Date();
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          
          setCanSubmit(latestRecord < oneWeekAgo);
        }
      } catch (error) {
        console.error('Error loading weight records:', error);
        toast({
          title: 'Error loading records',
          description: 'Could not load your weight history',
          variant: 'destructive',
        });
      }
    };
    
    loadWeightRecords();
  }, [user, toast]);

  // Handle image preview
  const handleImageChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      setImagePreview(null);
      return;
    }
    
    const file = fileList[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      setImagePreview(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit weight record
  const onSubmit = async (values: WeightFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to submit weight records',
        variant: 'destructive',
      });
      return;
    }
    
    if (!canSubmit) {
      toast({
        title: 'Submission limit reached',
        description: 'You can only submit once per week',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (values.image) {
        const file = values.image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('weight-images')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('weight-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }
      
      // Create weight record
      const { error } = await supabase
        .from('weight_records')
        .insert({
          user_id: user.id,
          weight: values.weight,
          notes: values.notes,
          image_url: imageUrl,
          is_approved: false, // Requires admin approval
          recorded_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      toast({
        title: 'Record submitted',
        description: 'Your weight record has been submitted for approval',
      });
      
      // Reset form
      form.reset();
      setImagePreview(null);
      
      // Refresh records
      const { data: newRecords } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });
        
      setRecords(newRecords || []);
      
      // Update submission limits
      setLastSubmission(new Date());
      setCanSubmit(false);
      
    } catch (error) {
      console.error('Error submitting weight record:', error);
      toast({
        title: 'Submission failed',
        description: 'Could not submit your weight record',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="h-5 w-5 text-primary mr-2" />
            Weight Tracker
          </CardTitle>
          <CardDescription>Track your weight progress over time</CardDescription>
        </CardHeader>
        
        <CardContent>
          {!canSubmit && lastSubmission && (
            <div className="bg-yellow-900/30 border border-yellow-900 rounded-md p-3 mb-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-200">You've already submitted this week</p>
                  <p className="text-xs text-yellow-300/70">
                    Last submission: {lastSubmission.toLocaleDateString()}. You can submit again after 7 days.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your weight" 
                        {...field} 
                        className="bg-zinc-900/70 border-zinc-800"
                        disabled={isSubmitting || !canSubmit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes about your progress" 
                        {...field} 
                        className="bg-zinc-900/70 border-zinc-800 resize-none h-20"
                        disabled={isSubmitting || !canSubmit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Progress Photo (optional)</FormLabel>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,auto]">
                      <FormControl>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors
                          ${!canSubmit ? 'border-gray-700 bg-gray-800/50' : 'border-gray-600 bg-gray-800/30 hover:bg-gray-800/50'}`}
                        >
                          <Input
                            type="file"
                            accept="image/*"
                            disabled={isSubmitting || !canSubmit}
                            className="hidden"
                            id="image-upload"
                            onChange={(e) => {
                              onChange(e.target.files);
                              handleImageChange(e.target.files);
                            }}
                            {...field}
                          />
                          <label 
                            htmlFor="image-upload"
                            className={`flex flex-col items-center justify-center h-full cursor-pointer
                              ${!canSubmit ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-400">
                              Click to upload a progress photo
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              PNG, JPG or GIF up to 5MB
                            </span>
                          </label>
                        </div>
                      </FormControl>
                      
                      {imagePreview && (
                        <div className="relative aspect-square w-24 h-24 rounded-md overflow-hidden border border-gray-700">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Weight Record"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {records.length > 0 && (
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {records.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-start p-3 border border-gray-800 rounded-lg bg-gray-900/50 text-sm">
                  <div className="mr-3 mt-1">
                    {record.is_approved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Info className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{record.weight} lbs</span>
                      <span className="text-gray-400 text-xs flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(record.recorded_at).toLocaleDateString()}
                      </span>
                    </div>
                    {record.notes && (
                      <p className="text-gray-400 mt-1 text-xs">{record.notes}</p>
                    )}
                    {record.image_url && (
                      <div className="mt-2">
                        <a 
                          href={record.image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 text-xs hover:underline"
                        >
                          View progress photo
                        </a>
                      </div>
                    )}
                    {!record.is_approved && (
                      <div className="mt-1 text-xs text-yellow-400">
                        Pending coach approval
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          {records.length > 5 && (
            <CardFooter>
              <Button variant="link" className="w-full text-sm">
                View all records
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default WeightTracker;
