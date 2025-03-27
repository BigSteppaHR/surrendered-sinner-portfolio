import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { FileEdit, FilePlus, FileText, Filter, Search, Trash2, Upload, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define invoice types
interface Invoice {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: string;
  issued_date: string;
  due_date: string | null;
  description: string | null;
  user_id: string | null;
  stripe_invoice_id: string | null;
  files?: InvoiceFile[];
}

interface InvoiceFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  download_url: string;
}

const AdminInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortColumn, setSortColumn] = useState<string | null>("issued_date");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [fileUploading, setFileUploading] = useState(false);
  const [showFileAttachDialog, setShowFileAttachDialog] = useState(false);
  
  useEffect(() => {
    fetchInvoices();
    
    // Set up realtime subscription for invoice updates
    const channel = supabase
      .channel('invoice-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'invoices' }, 
        () => fetchInvoices()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      // Fetch all invoices
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          files:user_files(
            id, 
            file_name, 
            file_type, 
            file_size, 
            download_url
          )
        `)
        .order('issued_date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setInvoices(data as Invoice[]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        variant: "destructive",
        title: "Failed to load invoices",
        description: "There was an error loading the invoice data."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer_email && invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let comparison = 0;
    switch (sortColumn) {
      case 'id':
        comparison = a.id.localeCompare(b.id);
        break;
      case 'customer':
        comparison = a.customer_name.localeCompare(b.customer_name);
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'issued_date':
        comparison = new Date(a.issued_date).getTime() - new Date(b.issued_date).getTime();
        break;
      case 'due_date':
        if (a.due_date && b.due_date) {
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        } else if (a.due_date) {
          comparison = 1;
        } else if (b.due_date) {
          comparison = -1;
        }
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);
        
      if (error) throw error;
      
      toast({
        title: "Invoice deleted",
        description: `Invoice ${invoice.id} has been deleted successfully.`
      });
      
      setShowDeleteDialog(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the invoice."
      });
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, invoiceId: string, userId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setFileUploading(true);
    
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${invoiceId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('training_materials')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('training_materials')
        .getPublicUrl(filePath);
        
      // Create record in user_files table
      const { error: fileError } = await supabase
        .from('user_files')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          download_url: publicUrlData.publicUrl,
          user_id: userId,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          file_path: filePath,
          description: `File for invoice ${invoiceId}`
        });
        
      if (fileError) throw fileError;
      
      toast({
        title: "File uploaded",
        description: "The file has been attached to the invoice successfully."
      });
      
      setShowFileAttachDialog(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading the file."
      });
    } finally {
      setFileUploading(false);
    }
  };
  
  const handleDownloadFile = async (file: InvoiceFile) => {
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
        variant: "destructive",
        title: "Download failed",
        description: "There was an error downloading the file."
      });
    }
  };
  
  const handleDeleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('training_materials')
        .remove([filePath]);
        
      if (storageError) throw storageError;
      
      // Delete file record
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) throw dbError;
      
      toast({
        title: "File deleted",
        description: "The file has been removed from the invoice."
      });
      
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the file."
      });
    }
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case 'failed':
      case 'cancelled':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" /> {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      default:
        return (
          <Badge>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        );
    }
  };
  
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-400 mt-1">Manage and track customer invoices</p>
        </div>
        <Button className="bg-[#ea384c] hover:bg-[#d32d3f]" onClick={() => window.location.href = "/admin/create-invoice"}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>
      
      <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2 text-[#ea384c]" />
            Invoice Management
          </CardTitle>
          <CardDescription>
            View, filter, and manage all customer invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-[#1a1a1a] gap-4">
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-9 w-full md:w-64 bg-[#0a0a0a] border-[#1a1a1a]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a] w-full md:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {filterStatus === "all" ? "All" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("paid")}>
                    Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("failed")}>
                    Failed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button 
              variant="outline" 
              className="border-[#1a1a1a] bg-[#0a0a0a] w-full md:w-auto"
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "ID,Customer,Email,Amount,Status,Date\n" +
                  sortedInvoices.map(invoice => {
                    return `${invoice.id},"${invoice.customer_name}","${invoice.customer_email || ''}",${invoice.amount},${invoice.status},${invoice.issued_date}`;
                  }).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `invoices-${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1a1a1a] hover:bg-[#1a1a1a]">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                    <div className="flex items-center">
                      Invoice #
                      {sortColumn === 'id' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('customer')}>
                    <div className="flex items-center">
                      Customer
                      {sortColumn === 'customer' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                    <div className="flex items-center">
                      Amount
                      {sortColumn === 'amount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('issued_date')}>
                    <div className="flex items-center">
                      Date
                      {sortColumn === 'issued_date' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      Status
                      {sortColumn === 'status' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ea384c] border-r-transparent"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">Loading invoices...</p>
                    </TableCell>
                  </TableRow>
                ) : sortedInvoices.length > 0 ? (
                  sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-[#1a1a1a] hover:bg-[#1a1a1a]">
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customer_name}</p>
                          <p className="text-xs text-gray-400">{invoice.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                      <TableCell>{new Date(invoice.issued_date).toLocaleDateString()}</TableCell>
                      <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {invoice.files && invoice.files.length > 0 ? (
                            <Badge variant="outline" className="flex items-center border-[#2a2a2a]">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {invoice.files.length}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-500">No files</span>
                          )}
                          {invoice.user_id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2 h-6 text-xs"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowFileAttachDialog(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                            }}
                          >
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-[#1a1a1a]">
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-10 w-10 text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium mb-1">No invoices found</h3>
                        <p className="text-gray-400 max-w-md">
                          {searchTerm || filterStatus !== 'all' 
                            ? "No invoices match your current filters. Try adjusting your search criteria."
                            : "No invoices have been created yet. Create your first invoice using the 'Create Invoice' button."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* View Invoice Dialog */}
      <Dialog open={!!selectedInvoice && !showDeleteDialog && !showFileAttachDialog} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete information about invoice {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-[#ea384c]">Invoice #{selectedInvoice.id}</h3>
                    <p className="text-sm text-gray-400">
                      Generated on {new Date(selectedInvoice.issued_date).toLocaleDateString()}
                    </p>
                  </div>
                  {renderStatusBadge(selectedInvoice.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-[#1a1a1a] pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Customer Information</h4>
                    <p className="font-medium">{selectedInvoice.customer_name}</p>
                    <p className="text-sm">{selectedInvoice.customer_email}</p>
                    {selectedInvoice.user_id && (
                      <p className="text-sm text-gray-400">User ID: {selectedInvoice.user_id}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Payment Details</h4>
                    <p className="font-medium">{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</p>
                    {selectedInvoice.due_date && (
                      <p className="text-sm text-gray-400">
                        Due: {new Date(selectedInvoice.due_date).toLocaleDateString()}
                      </p>
                    )}
                    {selectedInvoice.description && (
                      <p className="text-sm mt-2">{selectedInvoice.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-[#1a1a1a] pt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Attached Files</h4>
                  {selectedInvoice.files && selectedInvoice.files.length > 0 ? (
                    <div className="space-y-2">
                      {selectedInvoice.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-[#ea384c] mr-2" />
                            <div>
                              <p className="text-sm font-medium">{file.file_name}</p>
                              <p className="text-xs text-gray-400">
                                {(file.file_size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadFile(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDeleteFile(file.id, '')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">No files attached to this invoice</p>
                  )}
                  
                  {selectedInvoice.user_id && (
                    <Button 
                      variant="outline" 
                      className="mt-2 w-full border-dashed border-gray-500 text-gray-400"
                      onClick={() => {
                        setShowFileAttachDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice #{selectedInvoice?.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedInvoice && handleDeleteInvoice(selectedInvoice)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* File Attachment Dialog */}
      <Dialog open={showFileAttachDialog} onOpenChange={setShowFileAttachDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle>Attach File to Invoice</DialogTitle>
            <DialogDescription>
              Upload a file to attach to invoice #{selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                className="bg-[#1a1a1a] border-[#2a2a2a]"
                onChange={(e) => selectedInvoice?.user_id && handleFileUpload(e, selectedInvoice.id, selectedInvoice.user_id)}
                disabled={fileUploading || !selectedInvoice?.user_id}
              />
              {!selectedInvoice?.user_id && (
                <p className="text-yellow-500 text-xs">
                  This invoice is not associated with a user account, so files cannot be attached.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFileAttachDialog(false)}
              className="border-gray-600"
              disabled={fileUploading}
            >
              Cancel
            </Button>
            {fileUploading && (
              <Button disabled className="bg-[#ea384c]">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoices;
