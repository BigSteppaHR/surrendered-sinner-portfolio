
import React, { useState, useEffect } from "react";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ChevronDown,
  ArrowUpDown,
  Eye,
  XCircle,
  Clock,
  CheckCircle2,
  Paperclip,
  Plus
} from "lucide-react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Invoice types
interface Invoice {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: string;
  created_at: string;
  due_date: string;
  description: string;
  files?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  download_url: string;
}

const AdminInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchInvoices();
    
    // Set up realtime subscription
    const invoiceChannel = supabase
      .channel('invoice-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'invoices' }, 
        () => fetchInvoices()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(invoiceChannel);
    };
  }, []);
  
  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Fetch file attachments for each invoice
      const invoicesWithFiles = await Promise.all(
        (data || []).map(async (invoice) => {
          const { data: fileData, error: fileError } = await supabase
            .from('user_files')
            .select('*')
            .eq('invoice_id', invoice.id);
            
          return {
            ...invoice,
            files: fileError ? [] : fileData || []
          };
        })
      );
      
      setInvoices(invoicesWithFiles);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error fetching invoices",
        description: "There was a problem loading invoice data.",
        variant: "destructive"
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
      invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
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
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge>{status}</Badge>
        );
    }
  };
  
  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
        
      if (error) throw error;
      
      toast({
        title: "Invoice updated",
        description: "Invoice has been marked as paid.",
      });
      
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error updating invoice",
        description: "There was a problem updating the invoice status.",
        variant: "destructive"
      });
    }
  };
  
  const handleAttachFile = async (invoiceId: string, file: File) => {
    try {
      // First upload the file to storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `invoice_files/${invoiceId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invoice_files')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('invoice_files')
        .getPublicUrl(filePath);
        
      if (!publicURL) throw new Error('Failed to get public URL');
      
      // Save file reference in the database
      const { error: dbError } = await supabase
        .from('user_files')
        .insert({
          file_name: fileName,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          download_url: publicURL.publicUrl,
          invoice_id: invoiceId,
          description: `Attachment for invoice ${invoiceId}`
        });
        
      if (dbError) throw dbError;
      
      toast({
        title: "File attached",
        description: "The file has been attached to the invoice successfully.",
      });
      
      fetchInvoices();
    } catch (error) {
      console.error('Error attaching file:', error);
      toast({
        title: "Error attaching file",
        description: "There was a problem attaching the file to the invoice.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-400 mt-1">Manage and track customer invoices</p>
        </div>
        <Button className="bg-[#ea384c] hover:bg-[#d32d3f]" onClick={() => window.location.href = '/admin/create-invoice'}>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a] w-full md:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Selected
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
                  <TableHead>Description</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center">
                      Date
                      {sortColumn === 'date' && (
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
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 border-4 border-[#ea384c] border-r-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Loading invoices...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedInvoices.length > 0 ? (
                  sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-[#1a1a1a] hover:bg-[#1a1a1a]">
                      <TableCell className="font-medium">{invoice.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customer_name}</p>
                          <p className="text-xs text-gray-400">{invoice.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{invoice.description || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {invoice.files && invoice.files.length > 0 ? (
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">
                              <Paperclip className="h-3 w-3 mr-1" /> {invoice.files.length}
                            </Badge>
                          ) : (
                            <div className="flex">
                              <input
                                type="file"
                                id={`file-upload-${invoice.id}`}
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleAttachFile(invoice.id, e.target.files[0]);
                                  }
                                }}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-gray-400 hover:text-white"
                                onClick={() => document.getElementById(`file-upload-${invoice.id}`)?.click()}
                              >
                                <Plus className="h-4 w-4" /> Add
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status !== 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <p className="text-gray-400">No invoices found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="bg-[#0f0f0f] border-[#1a1a1a] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Invoice Details</DialogTitle>
              <DialogDescription>
                Viewing details for invoice #{selectedInvoice.id.substring(0, 8)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-400">Customer</h4>
                  <p className="font-medium">{selectedInvoice.customer_name}</p>
                  <p className="text-sm text-gray-400">{selectedInvoice.customer_email}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Amount</h4>
                  <p className="font-medium text-xl">${selectedInvoice.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Issue Date</h4>
                  <p>{format(new Date(selectedInvoice.created_at), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Due Date</h4>
                  <p>{selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), 'MMMM dd, yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Status</h4>
                  <div className="mt-1">{renderStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Description</h4>
                <p>{selectedInvoice.description || 'No description provided'}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Files</h4>
                {selectedInvoice.files && selectedInvoice.files.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInvoice.files.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm truncate max-w-[200px]">{file.file_name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => window.open(file.download_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No files attached</div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="bg-[#ea384c] hover:bg-[#d32d3f]"
                onClick={() => {
                  if (selectedInvoice.status !== 'paid') {
                    handleMarkAsPaid(selectedInvoice.id);
                  }
                  setSelectedInvoice(null);
                }}
                disabled={selectedInvoice.status === 'paid'}
              >
                {selectedInvoice.status === 'paid' ? 'Already Paid' : 'Mark as Paid'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminInvoices;
