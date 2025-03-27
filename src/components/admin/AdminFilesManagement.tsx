import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminFileUpload from './AdminFileUpload';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
}

const AdminFilesManagement = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
    
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
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_files')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      
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
          file_path: file.file_path
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
      
      // Log download activity (optional)
      // await supabase.from('file_download_logs').insert({
      //   user_id: user?.id,
      //   file_id: file.id,
      //   download_time: new Date().toISOString()
      // });
      
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

  return (
    <Card className="w-full bg-[#0f0f0f] border-[#333333]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <FileText className="h-5 w-5 text-sinner-red mr-2" />
          Training Files Management
        </CardTitle>
        <Button 
          onClick={() => setShowUpload(true)}
          className="bg-sinner-red hover:bg-red-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Files
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sinner-red border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-400">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-400">No files have been uploaded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
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
                          <Download className="h-4 w-4 text-sinner-red" />
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
