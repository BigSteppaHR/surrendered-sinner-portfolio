
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  MessageSquare,
  Download,
  Filter,
  ArrowUpDown,
  Eye,
  Plus,
  Trash2,
  Send,
  X
} from "lucide-react";

// Sample data - in a real app, this would come from your database
const invoices = [
  { id: "INV-001", customer: "John Doe", email: "john@example.com", amount: "$99.99", date: "2025-03-12", status: "Paid" },
  { id: "INV-002", customer: "Sarah Johnson", email: "sarah@example.com", amount: "$29.99", date: "2025-03-10", status: "Paid" },
  { id: "INV-003", customer: "Michael Brown", email: "michael@example.com", amount: "$249.99", date: "2025-03-09", status: "Pending" },
  { id: "INV-004", customer: "Emily Davis", email: "emily@example.com", amount: "$99.99", date: "2025-03-07", status: "Overdue" },
  { id: "INV-005", customer: "Robert Wilson", email: "robert@example.com", amount: "$29.99", date: "2025-03-05", status: "Paid" },
];

const tickets = [
  { id: "TIC-001", customer: "John Doe", email: "john@example.com", subject: "Billing issue with subscription", date: "2025-03-12", status: "Open", priority: "High" },
  { id: "TIC-002", customer: "Sarah Johnson", email: "sarah@example.com", subject: "Question about workout plan", date: "2025-03-10", status: "Closed", priority: "Medium" },
  { id: "TIC-003", customer: "Michael Brown", email: "michael@example.com", subject: "Can't access premium content", date: "2025-03-09", status: "In Progress", priority: "High" },
  { id: "TIC-004", customer: "Emily Davis", email: "emily@example.com", subject: "Request for custom plan", date: "2025-03-07", status: "Open", priority: "Low" },
  { id: "TIC-005", customer: "Robert Wilson", email: "robert@example.com", subject: "Payment method update", date: "2025-03-05", status: "Closed", priority: "Medium" },
];

const AdminInvoices = () => {
  const [searchInvoice, setSearchInvoice] = useState("");
  const [searchTicket, setSearchTicket] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const { toast } = useToast();
  
  // New invoice state
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    email: "",
    amount: "",
    description: "",
    dueDate: ""
  });
  
  const filteredInvoices = invoices.filter(invoice => 
    invoice.customer.toLowerCase().includes(searchInvoice.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchInvoice.toLowerCase()) ||
    invoice.email.toLowerCase().includes(searchInvoice.toLowerCase())
  );
  
  const filteredTickets = tickets.filter(ticket => 
    ticket.customer.toLowerCase().includes(searchTicket.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTicket.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTicket.toLowerCase()) ||
    ticket.email.toLowerCase().includes(searchTicket.toLowerCase())
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/20 text-green-500";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "Overdue":
        return "bg-red-500/20 text-red-500";
      case "Open":
        return "bg-[#9b87f5]/20 text-[#9b87f5]";
      case "In Progress":
        return "bg-[#7E69AB]/20 text-[#7E69AB]";
      case "Closed":
        return "bg-gray-500/20 text-gray-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-500";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-500";
      case "Low":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const handleCreateInvoice = () => {
    // In a real app, this would send data to your backend
    toast({
      title: "Invoice Created",
      description: `Invoice for ${newInvoice.customer} has been created.`,
    });
    setShowNewInvoiceDialog(false);
    // Reset form
    setNewInvoice({
      customer: "",
      email: "",
      amount: "",
      description: "",
      dueDate: ""
    });
  };

  const handleSendReply = () => {
    if (!ticketReply.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply message.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Reply Sent",
      description: `Your reply to ticket ${selectedTicket.id} has been sent.`,
    });
    
    setTicketReply("");
    if (ticketStatus) {
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${ticketStatus}.`,
      });
      setTicketStatus("");
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Invoices & Support</h1>
      
      <Tabs defaultValue="invoices">
        <TabsList className="bg-[#2A2F3C]">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="mt-6">
          <Card className="bg-[#252A38] border-[#353A48]">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Invoices</CardTitle>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-auto">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input 
                    className="bg-[#1A1F2C] border-[#353A48] pl-10 w-full sm:w-64"
                    placeholder="Search invoices..."
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowNewInvoiceDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" size="sm" className="text-gray-400">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="text-gray-400">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            
              <Table>
                <TableHeader>
                  <TableRow className="border-[#353A48]">
                    <TableHead className="w-[100px]">
                      <Button variant="ghost" className="p-0 h-auto font-medium flex items-center text-gray-400">
                        ID <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>
                      <Button variant="ghost" className="p-0 h-auto font-medium flex items-center text-gray-400">
                        Date <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-[#353A48] hover:bg-[#2A2F3C]/50">
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>
                          <div>
                            <p>{invoice.customer}</p>
                            <p className="text-xs text-gray-400">{invoice.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No invoices found matching the search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Invoice Detail Dialog */}
          {selectedInvoice && (
            <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
              <DialogContent className="bg-[#252A38] border-[#353A48] text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl">Invoice {selectedInvoice.id}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Details for invoice issued on {selectedInvoice.date}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Client</h4>
                      <p>{selectedInvoice.customer}</p>
                      <p className="text-sm text-gray-400">{selectedInvoice.email}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-medium text-gray-400">Amount</h4>
                      <p className="text-xl font-bold">{selectedInvoice.amount}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block mt-1 ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#353A48] pt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                    <p className="text-sm">Personal training sessions (4) - March 2025</p>
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between items-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedInvoice(null)}
                    >
                      Close
                    </Button>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Send to Client
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* New Invoice Dialog */}
          <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
            <DialogContent className="bg-[#252A38] border-[#353A48] text-white">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details to create a new invoice
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer Name</Label>
                    <Input 
                      id="customer"
                      className="bg-[#1A1F2C] border-[#353A48]"
                      value={newInvoice.customer}
                      onChange={(e) => setNewInvoice({...newInvoice, customer: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Customer Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      className="bg-[#1A1F2C] border-[#353A48]"
                      value={newInvoice.email}
                      onChange={(e) => setNewInvoice({...newInvoice, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input 
                      id="amount"
                      type="number"
                      step="0.01"
                      className="bg-[#1A1F2C] border-[#353A48]"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate"
                      type="date"
                      className="bg-[#1A1F2C] border-[#353A48]"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    className="bg-[#1A1F2C] border-[#353A48] min-h-[100px]"
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewInvoiceDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice}>
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="tickets" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-[#252A38] border-[#353A48]">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Support Tickets</CardTitle>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      className="bg-[#1A1F2C] border-[#353A48] pl-10 w-full sm:w-64"
                      placeholder="Search tickets..."
                      value={searchTicket}
                      onChange={(e) => setSearchTicket(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-[#9b87f5]/10 text-[#9b87f5] hover:bg-[#9b87f5]/20">All</Badge>
                    <Badge variant="outline" className="bg-transparent text-gray-400 hover:bg-gray-800">Open</Badge>
                    <Badge variant="outline" className="bg-transparent text-gray-400 hover:bg-gray-800">In Progress</Badge>
                    <Badge variant="outline" className="bg-transparent text-gray-400 hover:bg-gray-800">Closed</Badge>
                  </div>
                
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#353A48]">
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                          <TableRow 
                            key={ticket.id} 
                            className={`border-[#353A48] cursor-pointer hover:bg-[#2A2F3C]/50 ${selectedTicket?.id === ticket.id ? 'bg-[#2A2F3C]/70' : ''}`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <TableCell className="font-medium">{ticket.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate max-w-[200px]">{ticket.subject}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="truncate">{ticket.customer}</p>
                                <p className="text-xs text-gray-400 truncate">{ticket.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </TableCell>
                            <TableCell>{ticket.date}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                            No tickets found matching the search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            
            <div>
              {selectedTicket ? (
                <Card className="bg-[#252A38] border-[#353A48]">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority} Priority
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{selectedTicket.subject}</CardTitle>
                    <div className="text-sm text-gray-400 mt-1 flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>Ticket {selectedTicket.id}</span>
                      <span className="mx-2">•</span>
                      <span>Opened on {selectedTicket.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Customer Information</h4>
                      <div className="text-sm space-y-1 text-gray-300">
                        <p>Name: {selectedTicket.customer}</p>
                        <p>Email: {selectedTicket.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Message</h4>
                      <div className="bg-[#1A1F2C] p-3 rounded-md text-sm">
                        <p>Hello,</p>
                        <p className="my-2">I'm having an issue with {selectedTicket.subject.toLowerCase()}. Could you please help me resolve this as soon as possible?</p>
                        <p>Thank you,</p>
                        <p>{selectedTicket.customer}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Reply</h4>
                      <Textarea 
                        className="w-full h-32 bg-[#1A1F2C] border-[#353A48] p-3 text-sm"
                        placeholder="Type your response here..."
                        value={ticketReply}
                        onChange={(e) => setTicketReply(e.target.value)}
                      />
                      <div className="mt-2 flex justify-between">
                        <Select value={ticketStatus} onValueChange={setTicketStatus}>
                          <SelectTrigger className="text-xs bg-[#1A1F2C] border-[#353A48] w-40">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#252A38] border-[#353A48]">
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleSendReply}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#252A38] border-[#353A48] h-full flex items-center justify-center text-gray-400">
                  <CardContent className="text-center p-6">
                    <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-50" />
                    <p>Select a ticket to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInvoices;
