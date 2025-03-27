
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UploadCloud, Users, FileUp, AlertCircle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  user_id: z.string({
    required_error: "Please select a user",
  }),
  plan_id: z.string().optional(),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters",
  }),
  file: z.instanceof(File, {
    message: "Please upload a file",
  }).refine(file => file.size <= 10 * 1024 * 1024, {
    message: "File size must be less than 10MB",
  }),
});

type User = {
  id: string;
  full_name: string;
  email: string;
};

type Plan = {
  id: string;
  title: string;
};

const AdminFileUpload = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
        
      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Failed to load users",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setUsers(data || []);
    };
    
    fetchUsers();
  }, [toast]);
  
  useEffect(() => {
    if (!selectedUserId) return;
    
    const fetchUserPlans = async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('id, title')
        .eq('user_id', selectedUserId)
        .order('title');
        
      if (error) {
        console.error('Error fetching user plans:', error);
        toast({
          title: "Failed to load plans",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setPlans(data || []);
    };
    
    fetchUserPlans();
  }, [selectedUserId, toast]);
  
  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    form.setValue('user_id', userId);
    form.setValue('plan_id', undefined);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue('file', file);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `user_files/${values.user_id}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('training_materials')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('training_materials')
        .getPublicUrl(filePath);
      
      // 3. Store file metadata in database
      const { error: dbError } = await supabase
        .from('user_files')
        .insert({
          user_id: values.user_id,
          plan_id: values.plan_id || null,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          file_path: filePath,
          description: values.description,
          download_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });
      
      if (dbError) throw dbError;
      
      // 4. Create notification for user
      await supabase
        .from('user_notifications')
        .insert({
          user_id: values.user_id,
          title: "New Training Material Available",
          message: `A new file "${selectedFile.name}" has been uploaded to your account.`,
          notification_type: "file",
        });
      
      toast({
        title: "File uploaded successfully",
        description: "The user has been notified about the new file.",
      });
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="bg-[#0f0f0f] border-[#333]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileUp className="h-5 w-5 text-[#ea384c]" />
          Upload Training Materials
        </CardTitle>
        <CardDescription>
          Upload PDF files and training plans for your clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select 
                    onValueChange={(value) => handleUserChange(value)} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#333] focus:ring-[#ea384c]">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1a1a1a] border-[#333]">
                      {users.length === 0 ? (
                        <div className="flex items-center justify-center p-4 text-gray-400">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          No users found
                        </div>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id} className="focus:bg-[#333] focus:text-white">
                            {user.full_name || user.email}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Plan (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#333] focus:ring-[#ea384c]">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1a1a1a] border-[#333]">
                      {!selectedUserId ? (
                        <div className="flex items-center justify-center p-4 text-gray-400">
                          <Users className="h-4 w-4 mr-2" />
                          Select a client first
                        </div>
                      ) : plans.length === 0 ? (
                        <div className="flex items-center justify-center p-4 text-gray-400">
                          <Package className="h-4 w-4 mr-2" />
                          No plans found for this client
                        </div>
                      ) : (
                        plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="focus:bg-[#333] focus:text-white">
                            {plan.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    If this file is related to a specific training plan, select it here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a description of this file" 
                      className="bg-[#1a1a1a] border-[#333] focus:ring-[#ea384c] min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This description will be visible to the client when downloading
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#333] rounded-md p-6 hover:border-[#ea384c]/50 transition-colors">
                      <UploadCloud className="h-10 w-10 text-[#ea384c] mb-2" />
                      <p className="text-gray-300 mb-2">
                        {selectedFile ? selectedFile.name : "Drag and drop or click to upload"}
                      </p>
                      {selectedFile && (
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
                        {...field}
                      />
                      <label htmlFor="file-upload">
                        <div className="mt-4 bg-[#333] hover:bg-[#444] text-white cursor-pointer py-2 px-4 rounded-md inline-block">
                          Choose File
                        </div>
                      </label>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, 7Z
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="bg-[#333]" />
            
            <Button 
              type="submit" 
              className="bg-[#ea384c] hover:bg-[#d32d40] text-white w-full md:w-auto"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="h-5 w-5 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AdminFileUpload;
