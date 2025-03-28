
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Trash2, Upload, Search, Filter, FileUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminFileUpload from './AdminFileUpload';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { handleDatabaseError } from "@/utils/databaseErrorHandler";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  full_name: string;
  email: string;
}

interface FileRecord {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  description: string;
  download_url: string;
  uploaded_at: string;
  uploaded_by: string;
  user_id: string;
  user_name: string;
  user_email: string;
  profiles: ProfileData;
  file_path: string;
  plan_id: string | null;
  subscription_id: string | null;
  file_category: string;
  plan_title?: string;
  subscription_name?: string;
}

interface WorkoutPlan {
  id: string;
  title: string;
}

interface SubscriptionPackage {
  id: string;
  name: string;
}

const AdminFilesManagement = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterPlan, setFilterPlan] = useState<string>('');
  const [filterSubscription, setFilterSubscription] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPackage[]>([]);
  const [users, setUsers] = useState<{id: string, full_name: string, email: string}[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });
        
      if (usersError) throw usersError;
      setUsers(usersData || []);
      
      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from('workout_plans')
        .select('id, title')
        .order('title', { ascending: true });
        
      if (plansError) throw plansError;
      setPlans(plansData || []);
      
      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscription_packages')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
        
      if (subsError) throw subsError;
      setSubscriptions(subsData || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('admin-files-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_files' }, 
        () => fetchFiles()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_files')
        .select(`
          *,
          profiles:user_id (full_name, email),
          plans:plan_id (title),
          subscriptions:subscription_id (name)
        `)
        .order('uploaded_at', { ascending: false });
        
      if (error) {
        handleDatabaseError(error);
        throw error;
      }
      
      if (data) {
        const formattedFiles: FileRecord[] = data.map(file => ({
          id: file.id,
          file_name: file.file_name,
          file_type: file.file_type,
          file_size: file.file_size,
          description: file.description || '',
          download_url: file.download_url,
          uploaded_at: new Date(file.uploaded_at).toLocaleDateString(),
          uploaded_by: file.uploaded_by,
          user_id: file.user_id,
          user_name: file.profiles?.full_name || 'Unknown',
          user_email: file.profiles?.email || 'No email',
          profiles: file.profiles,
          file_path: file.file_path,
          plan_id: file.plan_id,
          subscription_id: file.subscription_id,
          file_category: file.file_category || 'general',
          plan_title: file.plans?.title,
          subscription_name: file.subscriptions?.name
        }));
        
        setFiles(formattedFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error loading files",
        description: "There was a problem fetching the file list.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: FileRecord) => {
    if (!file.download_url) {
      toast({
        title: "Download error",
        description: "The file URL is missing. Please contact support.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch(file.download_url);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (file: FileRecord) => {
    try {
      // Delete file from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('training_materials')
        .remove([file.file_path]);
        
      if (storageError) throw storageError;
      
      // Delete file record from database
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', file.id);
        
      if (dbError) throw dbError;
      
      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
        variant: "default"
      });
      
      fetchFiles(); // Refresh file list
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const getFileCategoryBadge = (category: string) => {
    const categories: Record<string, { color: string, label: string }> = {
      'general': { color: 'bg-gray-500', label: 'General' },
      'workout': { color: 'bg-blue-500', label: 'Workout' },
      'nutrition': { color: 'bg-green-500', label: 'Nutrition' },
      'progress': { color: 'bg-purple-500', label: 'Progress' },
      'supplement': { color: 'bg-yellow-500', label: 'Supplement' },
      'assessment': { color: 'bg-red-500', label: 'Assessment' }
    };
    
    const categoryInfo = categories[category] || categories.general;
    
    return (
      <Badge className={`${categoryInfo.color}/20 border-${categoryInfo.color}/40 text-${categoryInfo.color}/90`}>
        {categoryInfo.label}
      </Badge>
    );
  };
  
  const filteredFiles = files.filter(file => {
    // Apply search term filter
    const searchMatch = 
      file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply user filter
    const userMatch = !filterUser || file.user_id === filterUser;
    
    // Apply plan filter
    const planMatch = !filterPlan || file.plan_id === filterPlan;
    
    // Apply subscription filter
    const subscriptionMatch = !filterSubscription || file.subscription_id === filterSubscription;
    
    // Apply category filter
    const categoryMatch = !filterCategory || file.file_category === filterCategory;
    
    return searchMatch && userMatch && planMatch && subscriptionMatch && categoryMatch;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterUser('');
    setFilterPlan('');
    setFilterSubscription('');
    setFilterCategory('');
  };

  return (
    <Card className="w-full bg-[#0f0f0f] border-[#333333]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <FileText className="h-5 w-5 text-[#ea384c] mr-2" />
          Training Files Management
        </CardTitle>
        <Button 
          onClick={() => setShowUpload(true)}
          className="bg-[#ea384c] hover:bg-red-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Files
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#1a1a1a] border-[#333]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-[#333] text-gray-400 hover:text-white"
              >
                Reset Filters
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={fetchFiles}
                className="h-9 w-9 border-[#333]"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectItem value="">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectItem value="">All Plans</SelectItem>
                <SelectItem value="null">No Plan</SelectItem>
                {plans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterSubscription} onValueChange={setFilterSubscription}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333]">
                <SelectValue placeholder="Filter by subscription" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectItem value="">All Subscriptions</SelectItem>
                <SelectItem value="null">No Subscription</SelectItem>
                {subscriptions.map(sub => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="progress">Progress Tracking</SelectItem>
                <SelectItem value="supplement">Supplements</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <Clock className="inline-block h-8 w-8 animate-spin text-[#ea384c]" />
            <p className="mt-2 text-gray-400">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-8 text-center">
            {searchTerm || filterUser || filterPlan || filterSubscription || filterCategory ? (
              <p className="text-gray-400">No files match the selected filters.</p>
            ) : (
              <p className="text-gray-400">No files have been uploaded yet.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan/Subscription</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      {file.file_name}
                      {file.description && (
                        <p className="text-xs text-gray-400 mt-1">{file.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{file.user_name}</p>
                        <p className="text-xs text-gray-400">{file.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {file.plan_title && (
                          <Badge variant="outline" className="bg-blue-950/30 text-blue-400 border-blue-900/40 mr-1">
                            {file.plan_title}
                          </Badge>
                        )}
                        {file.subscription_name && (
                          <Badge variant="outline" className="bg-purple-950/30 text-purple-400 border-purple-900/40">
                            {file.subscription_name}
                          </Badge>
                        )}
                        {!file.plan_title && !file.subscription_name && (
                          <span className="text-gray-500 text-xs">General</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getFileCategoryBadge(file.file_category)}
                    </TableCell>
                    <TableCell>{formatFileSize(file.file_size)}</TableCell>
                    <TableCell>{file.uploaded_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 border-[#333] hover:border-[#444] hover:bg-[#1a1a1a]"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4 text-[#ea384c]" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 border-[#333] hover:border-red-900 hover:bg-[#1a1a1a]"
                          onClick={() => {
                            setSelectedFile(file);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <AdminFileUpload 
          isOpen={showUpload} 
          onClose={() => setShowUpload(false)} 
          onSuccess={() => {
            fetchFiles();
            setShowUpload(false);
          }}
        />
        
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-[#0f0f0f] border-[#333] text-white">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete "{selectedFile?.file_name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="border-[#333] text-white hover:bg-[#1a1a1a] mr-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedFile) {
                    handleDelete(selectedFile);
                    setShowDeleteDialog(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminFilesManagement;
