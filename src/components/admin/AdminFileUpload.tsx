import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileUp, Users, Calendar, FilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface WorkoutPlan {
  id: string;
  title: string;
  user_id: string;
}

const AdminFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name', { ascending: true });
          
        if (error) throw error;
        if (data) setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Failed to load users",
          description: "There was an error loading the user list.",
          variant: "destructive"
        });
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      if (!selectedUser) {
        setWorkoutPlans([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .select('id, title, user_id')
          .eq('user_id', selectedUser);
          
        if (error) throw error;
        if (data) setWorkoutPlans(data);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
      }
    };
    
    fetchWorkoutPlans();
  }, [selectedUser]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Set default file name from uploaded file
      if (!fileName) {
        setFileName(selectedFile.name);
      }
    }
  };
  
  const simulateProgress = () => {
    setUploadProgress(0);
    const timer = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + 5;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(timer);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedUser) {
      toast({
        title: "No user selected",
        description: "Please select a user for this file.",
        variant: "destructive"
      });
      return;
    }
    
    if (!fileName.trim()) {
      toast({
        title: "File name required",
        description: "Please provide a name for the file.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    const progressCleanup = simulateProgress();
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${selectedUser}/${Date.now()}-${file.name}`;
      
      // Upload the file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('user_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) throw storageError;
      
      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('user_files')
        .getPublicUrl(filePath);
      
      // Save file metadata to the database
      const { error: dbError } = await supabase
        .from('user_files')
        .insert({
          user_id: selectedUser,
          file_name: fileName,
          file_type: file.type,
          file_size: file.size,
          description: description,
          download_url: urlData.publicUrl,
          uploaded_by: user?.id,
          plan_id: selectedPlan || null
        });
      
      if (dbError) throw dbError;
      
      // Clear form after successful upload
      setFile(null);
      setFileName('');
      setDescription('');
      setSelectedPlan('');
      
      // Ensure upload progress is 100% at the end
      setUploadProgress(100);
      
      toast({
        title: "File uploaded successfully",
        description: "The file has been uploaded and is now available to the user.",
      });
      
      // Reset the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the file",
        variant: "destructive",
      });
    } finally {
      progressCleanup();
      setTimeout(() => {
        setIsLoading(false);
        setUploadProgress(0);
      }, 500);
    }
  };
  
  return (
    <Card className="bg-[#0f0f0f] border-[#333] w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileUp className="h-5 w-5 text-[#ea384c]" />
          Upload Training Material
        </CardTitle>
        <CardDescription>
          Upload files to make them available for users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="user">Select User</Label>
            <Select onValueChange={(value) => setSelectedUser(value)}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white focus:ring-[#ea384c]">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="plan">Select Workout Plan (Optional)</Label>
            <Select onValueChange={(value) => setSelectedPlan(value)}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white focus:ring-[#ea384c]">
                <SelectValue placeholder="No plan selected" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectItem value="">General</SelectItem>
                {workoutPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="file-name">File Name</Label>
            <Input
              type="text"
              id="file-name"
              placeholder="Enter file name"
              className="bg-[#1a1a1a] border-[#333] text-white focus:ring-[#ea384c]"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter file description"
              className="bg-[#1a1a1a] border-[#333] text-white focus:ring-[#ea384c]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="file-upload">Upload File</Label>
            <Input
              type="file"
              id="file-upload"
              className="bg-[#1a1a1a] file:bg-[#333] file:border-0 file:text-white file:h-11 file:py-3 file:px-4 file:rounded-md border-[#333] text-white focus:ring-[#ea384c]"
              onChange={handleFileChange}
            />
          </div>
          
          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="bg-[#1a1a1a]" />
          )}
          
          <Button 
            type="submit"
            className="bg-[#ea384c] hover:bg-red-700 text-white w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"/>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FilePlus className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminFileUpload;
