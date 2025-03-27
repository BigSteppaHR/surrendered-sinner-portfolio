
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FilePdf, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface UserFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  description: string;
  download_url: string;
  uploaded_at: string;
  plan_id?: string;
  plan_name?: string;
}

const FileDownloads = () => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('user_files')
          .select(`
            id, 
            file_name, 
            file_type, 
            file_size, 
            description, 
            download_url, 
            uploaded_at,
            plan_id,
            workout_plans (title)
          `)
          .eq('user_id', user.id)
          .order('uploaded_at', { ascending: false });
          
        if (error) throw error;
        
        const formattedFiles = data.map(file => ({
          id: file.id,
          file_name: file.file_name,
          file_type: file.file_type,
          file_size: file.file_size,
          description: file.description,
          download_url: file.download_url,
          uploaded_at: new Date(file.uploaded_at).toLocaleDateString(),
          plan_id: file.plan_id,
          plan_name: file.workout_plans?.title || 'General'
        }));
        
        setFiles(formattedFiles);
      } catch (error) {
        console.error('Error fetching user files:', error);
        toast({
          title: "Failed to load files",
          description: "There was an error loading your files. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserFiles();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('user-files-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_files', filter: `user_id=eq.${user?.id}` }, 
        () => fetchUserFiles()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  
  const handleDownload = async (file: UserFile) => {
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
      
      // Log download activity
      await supabase.from('file_download_logs').insert({
        user_id: user?.id,
        file_id: file.id,
        download_time: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FilePdf className="h-10 w-10 text-sinner-red" />;
    } 
    return <FileText className="h-10 w-10 text-sinner-red" />;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <Card className="bg-[#0f0f0f] border-[#333] w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Download className="h-5 w-5 text-sinner-red" />
          Your Training Materials
        </CardTitle>
        <CardDescription>
          Access and download your personal training files and plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-4 border border-[#222] rounded-md">
                <Skeleton className="h-10 w-10 rounded-md bg-gray-800 mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-[200px] bg-gray-800 mb-2" />
                  <Skeleton className="h-4 w-[150px] bg-gray-800" />
                </div>
                <Skeleton className="h-9 w-[100px] bg-gray-800" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Files Available</h3>
            <p className="text-gray-400 max-w-md">
              You don't have any training materials available for download yet. 
              Files will appear here once your coach uploads them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div 
                key={file.id}
                className="flex flex-col md:flex-row md:items-center p-4 border border-[#222] rounded-md hover:border-[#444] transition-colors bg-black/30"
              >
                <div className="flex items-center mb-4 md:mb-0">
                  {getFileIcon(file.file_type)}
                  <div className="ml-4 flex-1">
                    <h4 className="text-white font-medium">{file.file_name}</h4>
                    <div className="flex flex-wrap gap-x-4 text-sm text-gray-400">
                      <span>Plan: {file.plan_name}</span>
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>Added: {file.uploaded_at}</span>
                    </div>
                    {file.description && (
                      <p className="text-sm text-gray-300 mt-1">{file.description}</p>
                    )}
                  </div>
                </div>
                <Button 
                  className="bg-sinner-red hover:bg-red-700 text-white md:ml-4 mt-2 md:mt-0"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileDownloads;
