
import { useState } from "react";
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
  CheckCircle2,
  Clock
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

// Sample data - in a real app, this would come from an API
const sampleInvoices = [
  { 
    id: "INV-001", 
    customerId: "CUST-123",
    customerName: "John Smith", 
    customerEmail: "john@example.com", 
    amount: 99.99, 
    plan: "Pro Plan", 
    date: new Date(2023, 7, 12), 
    dueDate: new Date(2023, 8, 12),
    status: "paid" 
  },
  { 
    id: "INV-002", 
    customerId: "CUST-234",
    customerName: "Sarah Johnson", 
    customerEmail: "sarah@example.com", 
    amount: 29.99, 
    plan: "Basic Plan", 
    date: new Date(2023, 7, 10), 
    dueDate: new Date(2023, 8, 10),
    status: "paid" 
  },
  { 
    id: "INV-003", 
    customerId: "CUST-345",
    customerName: "Michael Brown", 
    customerEmail: "michael@example.com", 
    amount: 249.99, 
    plan: "Elite Plan", 
    date: new Date(2023, 7, 9), 
    dueDate: new Date(2023, 8, 9),
    status: "paid" 
  },
  { 
    id: "INV-004", 
    customerId: "CUST-456",
    customerName: "Emily Davis", 
    customerEmail: "emily@example.com", 
    amount: 99.99, 
    plan: "Pro Plan", 
    date: new Date(2023, 7, 7), 
    dueDate: new Date(2023, 8, 7),
    status: "failed" 
  },
  { 
    id: "INV-005", 
    customerId: "CUST-567",
    customerName: "Robert Wilson", 
    customerEmail: "robert@example.com", 
    amount: 29.99, 
    plan: "Basic Plan", 
    date: new Date(2023, 7, 5), 
    dueDate: new Date(2023, 8, 5),
    status: "paid" 
  },
  { 
    id: "INV-006", 
    customerId: "CUST-678",
    customerName: "James Anderson", 
    customerEmail: "james@example.com", 
    amount: 249.99, 
    plan: "Elite Plan", 
    date: new Date(2023, 7, 3), 
    dueDate: new Date(2023, 8, 3),
    status: "pending" 
  },
];

const AdminInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<typeof sampleInvoices[0] | null>(null);
  
  // Filter invoices based on search term and status
  const filteredInvoices = sampleInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'date':
        comparison = a.date.getTime() - b.date.getTime();
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-400 mt-1">Manage and track customer invoices</p>
        </div>
        <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
          <Download className="h-4 w-4 mr-2" />
          Export All
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
                  <TableHead>Plan</TableHead>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.length > 0 ? (
                  sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-[#1a1a1a] hover:bg-[#1a1a1a]">
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customerName}</p>
                          <p className="text-xs text-gray-400">{invoice.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{invoice.plan}</TableCell>
                      <TableCell>{format(invoice.date, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-400 hover:text-white"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                            <DialogHeader>
                              <DialogTitle>Invoice Details</DialogTitle>
                              <DialogDescription>
                                Complete information about invoice {invoice.id}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedInvoice && (
                              <>
                                <div className="grid gap-4 py-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-bold text-[#ea384c]">Invoice #{selectedInvoice.id}</h3>
                                      <p className="text-sm text-gray-400">
                                        Generated on {format(selectedInvoice.date, 'MMMM dd, yyyy')}
                                      </p>
                                    </div>
                                    {renderStatusBadge(selectedInvoice.status)}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 border-t border-[#1a1a1a] pt-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-400">Customer Information</h4>
                                      <p className="font-medium">{selectedInvoice.customerName}</p>
                                      <p className="text-sm">{selectedInvoice.customerEmail}</p>
                                      <p className="text-sm text-gray-400">Customer ID: {selectedInvoice.customerId}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-400">Payment Details</h4>
                                      <p className="font-medium">${selectedInvoice.amount.toFixed(2)}</p>
                                      <p className="text-sm">Plan: {selectedInvoice.plan}</p>
                                      <p className="text-sm text-gray-400">
                                        Due: {format(selectedInvoice.dueDate, 'MMMM dd, yyyy')}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="border-t border-[#1a1a1a] pt-4">
                                    <h4 className="text-sm font-medium text-gray-400 mb-2">Invoice Items</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-[#1a1a1a]">
                                          <TableHead>Item</TableHead>
                                          <TableHead>Period</TableHead>
                                          <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow className="border-[#1a1a1a]">
                                          <TableCell>{selectedInvoice.plan} Subscription</TableCell>
                                          <TableCell>
                                            {format(selectedInvoice.date, 'MMM dd, yyyy')} - {format(selectedInvoice.dueDate, 'MMM dd, yyyy')}
                                          </TableCell>
                                          <TableCell className="text-right">${selectedInvoice.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow className="border-[#1a1a1a] font-medium">
                                          <TableCell colSpan={2} className="text-right">Total</TableCell>
                                          <TableCell className="text-right">${selectedInvoice.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
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
                            : "Invoices from your Stripe account will appear here automatically."}
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
    </div>
  );
};

export default AdminInvoices;
