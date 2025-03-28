
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface AdminFileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WorkoutPlan {
  id: string;
  title: string;
  user_id: string;
}

const AdminFileUpload: React.FC<AdminFileUploadProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .select('id, title, user_id');
          
        if (error) throw error;
        
        if (data) {
          setPlans(data as WorkoutPlan[]);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('is_active', true);
          
        if (error) throw error;
        
        if (data) {
          setUsers(data as { id: string; full_name: string }[]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    if (isOpen) {
      fetchPlans();
      fetchUsers();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Set default file name from the file itself
      if (!fileName) {
        setFileName(selectedFile.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedUser) {
      toast({
        title: "Missing information",
        description: "Please select a file and a user to upload for.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
    
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${selectedUser}/${Date.now()}-${fileName.replace(/\s+/g, '-')}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training_materials')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('training_materials')
        .getPublicUrl(filePath);
        
      if (!urlData?.publicUrl) throw new Error('Failed to get public URL');
      
      // Record file in database
      const { error: dbError } = await supabase
        .from('user_files')
        .insert({
          user_id: selectedUser,
          plan_id: selectedPlan || null,
          file_name: fileName || file.name,
          file_type: file.type,
          file_size: file.size,
          description: description,
          file_path: filePath,
          download_url: urlData.publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (dbError) throw dbError;
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Upload successful",
        description: "The file has been uploaded and is now available to the user.",
        variant: "default"
      });
      
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setFileName('');
    setDescription('');
    setSelectedPlan(null);
    setSelectedUser(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0f0f0f] border-[#333] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 text-sinner-red mr-2" />
            Upload Training File
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="user">User</Label>
            <Select
              value={selectedUser || ''}
              onValueChange={setSelectedUser}
              disabled={isUploading}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectGroup>
                  <SelectLabel>Users</SelectLabel>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || 'Unnamed User'}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="plan">Workout Plan (Optional)</Label>
            <Select
              value={selectedPlan || ''}
              onValueChange={setSelectedPlan}
              disabled={isUploading}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectValue placeholder="Select workout plan" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectGroup>
                  <SelectLabel>Plans</SelectLabel>
                  <SelectItem value="">General (No specific plan)</SelectItem>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="file">Select File</Label>
            <div className="mt-1 flex items-center">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
                className="bg-[#1a1a1a] border-[#333] text-white hover:bg-[#333] mr-2 w-full"
                disabled={isUploading}
              >
                <FileUp className="h-4 w-4 mr-2" />
                {file ? 'Change File' : 'Select File'}
              </Button>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="fileName">File Name (Optional)</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Custom file name (defaults to original file name)"
              className="bg-[#1a1a1a] border-[#333] text-white"
              disabled={isUploading}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this file"
              className="bg-[#1a1a1a] border-[#333] text-white min-h-[80px]"
              disabled={isUploading}
            />
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-[#333]" indicatorClassName="bg-sinner-red" />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#333] text-white hover:bg-[#1a1a1a]"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              className="bg-sinner-red hover:bg-red-700 text-white"
              disabled={!file || !selectedUser || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
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
      </DialogContent>
    </Dialog>
  );
};

export default AdminFileUpload;
