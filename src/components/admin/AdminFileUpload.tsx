
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Upload, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { withErrorHandling } from "@/utils/databaseErrorHandler";

interface UserPlan {
  id: string;
  title: string;
  user_id: string;
}

const AdminFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name');
          
        if (error) throw error;
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Failed to load users",
          description: "There was an error loading users. Please try again later.",
          variant: "destructive"
        });
      }
    };

    fetchUsers();
  }, [toast]);

  useEffect(() => {
    // Clear the selected plan when the user changes
    if (selectedUser) {
      setSelectedPlan('');
      fetchUserPlans(selectedUser);
    }
  }, [selectedUser]);

  const fetchUserPlans = async (userId: string) => {
    try {
      // Use await here to properly wait for the query to complete
      const { data, error } = await supabase
        .from('workout_plans')
        .select('id, title, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure data is properly typed
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching user plans:', error);
      toast({
        title: "Failed to load plans",
        description: "There was an error loading user plans. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedUser || !user?.id) {
      toast({
        title: "Missing information",
        description: "Please select a user and a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a folder structure using the user ID to organize files
      const folderPath = `${selectedUser}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      // Upload the file to storage with progress tracking
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training_materials')
        .upload(folderPath, file, {
          cacheControl: '3600',
          upsert: false,
        });
        
      if (uploadError) throw uploadError;
      
      // Get a public URL for the uploaded file
      const { data: publicUrlData } = await supabase.storage
        .from('training_materials')
        .getPublicUrl(folderPath);
        
      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to generate public URL');
      }
      
      // Save file metadata to the database
      const { error: metadataError } = await supabase.from('user_files').insert({
        user_id: selectedUser,
        plan_id: selectedPlan || null,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: folderPath,
        description: description,
        download_url: publicUrlData.publicUrl,
        uploaded_by: user.id
      });
      
      if (metadataError) throw metadataError;
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded for the selected user.`,
      });
      
      // Reset form
      setFile(null);
      setDescription('');
      setUploadProgress(0);
      
      // Clear file input by recreating it
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the file.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Simulate upload progress since we can't use onUploadProgress directly
  useEffect(() => {
    if (isUploading && uploadProgress < 100) {
      const timer = setTimeout(() => {
        setUploadProgress(prevProgress => {
          // Increase progress gradually
          const newProgress = prevProgress + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress; // Cap at 95% until actually complete
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    if (uploadSuccess) {
      setUploadProgress(100);
    }
  }, [isUploading, uploadProgress, uploadSuccess]);

  return (
    <Card className="bg-[#0f0f0f] border-[#333]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileUp className="h-5 w-5 text-[#ea384c]" />
          Upload Training Materials
        </CardTitle>
        <CardDescription>
          Upload files for clients to access in their dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user" className="text-white">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333]">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                {users.length === 0 ? (
                  <div className="flex items-center justify-center p-4 text-gray-400">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading users...
                  </div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="hover:bg-[#333]">
                      <div className="flex flex-col">
                        <span>{user.full_name || 'Unnamed User'}</span>
                        <span className="text-xs text-gray-400">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {selectedUser && (
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-white">Link to Training Plan (Optional)</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#333]">
                  <SelectValue placeholder="Select a plan (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333]">
                  <SelectItem value="" className="hover:bg-[#333]">No Plan (General File)</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} className="hover:bg-[#333]">
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-white">File</Label>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#333] rounded-md hover:border-[#ea384c] transition-colors">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-400 mb-2 text-sm text-center">
                Click to browse or drag and drop 
                <br />(PDF, DOCX, JPG, PNG, MP4)
              </p>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="border-[#333] hover:bg-[#333] hover:text-white"
              >
                Browse Files
              </Button>
              {file && (
                <div className="mt-4 text-sm text-white flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description of the file..."
              className="bg-[#1a1a1a] border-[#333] min-h-[100px]"
            />
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-[#333]" />
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleUpload}
              disabled={!file || !selectedUser || isUploading}
              className="bg-[#ea384c] hover:bg-[#ea384c]/80 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Uploaded!
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFileUpload;
