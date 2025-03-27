
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileUp, Trash2, Download, FileText, Files, Search } from "lucide-react";
import AdminFileUpload from "./AdminFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
  user_name?: string;
  user_email?: string;
  profiles?: { 
    full_name: string | null; 
    email: string | null;
  };
}

const AdminFilesManagement = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const fetchFiles = async () => {
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
          uploaded_by,
          user_id,
          profiles:user_id(full_name, email)
        `)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedFiles = data.map(file => ({
        id: file.id,
        file_name: file.file_name,
        file_type: file.file_type,
        file_size: file.file_size,
        description: file.description || '',
        download_url: file.download_url,
        uploaded_at: new Date(file.uploaded_at).toLocaleString(),
        uploaded_by: file.uploaded_by,
        user_id: file.user_id,
        user_name: file.profiles?.full_name || 'Unknown',
        user_email: file.profiles?.email || 'Unknown',
        profiles: file.profiles
      }));
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Failed to load files",
        description: "There was an error loading the files. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
  }, [toast]);
  
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Delete file metadata from database first
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) throw dbError;
      
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully.",
      });
      
      // We don't need to manually remove from the state as the realtime subscription will update it
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "There was an error deleting the file",
        variant: "destructive",
      });
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (file.user_email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Files Management</h1>
      </div>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="bg-[#1a1a1a] border-b border-[#333]">
          <TabsTrigger value="upload" className="data-[state=active]:bg-[#ea384c] data-[state=active]:text-white">
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-[#ea384c] data-[state=active]:text-white">
            Manage Files
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="pt-4">
          <AdminFileUpload />
        </TabsContent>
        
        <TabsContent value="manage" className="pt-4">
          <Card className="bg-[#0f0f0f] border-[#333]">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Files className="h-5 w-5 text-[#ea384c]" />
                Manage Files
              </CardTitle>
              <CardDescription>
                View, download and manage uploaded training materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search files by name, description or user..."
                  className="pl-10 bg-[#1a1a1a] border-[#333] focus:ring-[#ea384c]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-md bg-gray-800" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-[200px] bg-gray-800 mb-2" />
                        <Skeleton className="h-4 w-[150px] bg-gray-800" />
                      </div>
                      <Skeleton className="h-9 w-[100px] bg-gray-800" />
                    </div>
                  ))}
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  {searchQuery ? (
                    <p>No files match your search criteria</p>
                  ) : (
                    <p>No files have been uploaded yet</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-[#1a1a1a] border-[#333]">
                        <TableHead>File Name</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFiles.map((file) => (
                        <TableRow key={file.id} className="hover:bg-[#1a1a1a] border-[#333]">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-[#ea384c] mr-2 flex-shrink-0" />
                              <div>
                                <div className="text-white truncate max-w-[200px]">{file.file_name}</div>
                                <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                  {file.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="truncate max-w-[150px]">
                              <div className="text-white">{file.user_name}</div>
                              <div className="text-xs text-gray-400">{file.user_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{file.uploaded_at}</TableCell>
                          <TableCell>{formatFileSize(file.file_size)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <a 
                                href={file.download_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#333] hover:bg-[#444] transition-colors"
                              >
                                <Download className="h-4 w-4 text-white" />
                              </a>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteFile(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFilesManagement;
