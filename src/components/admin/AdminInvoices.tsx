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
import { supabase } from "@/integrations/supabase/client";
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
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

type InvoiceType = {
  id: string;
  customer: string;
  email: string;
  amount: string;
  date: string;
  status: string;
};

type TicketType = {
  id: string;
  customer: string;
  email: string;
  subject: string;
  date: string;
  status: string;
  priority: string;
};

// Define type for the support ticket response from Supabase
type TicketResponse = {
  id: string;
  subject: string;
  type: string;
  status: string;
  created_at: string;
  message: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const AdminInvoices = () => {
  const [searchInvoice, setSearchInvoice] = useState("");
  const [searchTicket, setSearchTicket] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState("");
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();
  
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    email: "",
    amount: "",
    description: "",
    dueDate: ""
  });
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoadingInvoices(true);
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { action: 'list-invoices', limit: 100 },
        });
        
        if (error) throw new Error(error.message);
        
        if (data && Array.isArray(data)) {
          setInvoices(data);
        } else {
          setInvoices([]);
        }
      } catch (err: any) {
        console.error("Error fetching invoices:", err);
        toast({
          title: "Failed to load invoices",
          description: err.message || "There was an error loading invoice data",
          variant: "destructive"
        });
        setInvoices([]);
      } finally {
        setIsLoadingInvoices(false);
      }
    };
    
    const fetchTickets = async () => {
      try {
        setIsLoadingTickets(true);
        const { data, error } = await supabase
          .from('support_tickets')
          .select(`
            id,
            subject,
            type,
            status,
            created_at,
            message,
            user_id,
            profiles(full_name, email)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formattedTickets = data.map((ticket: any) => ({
            id: ticket.id,
            customer: ticket.profiles?.[0]?.full_name || 'Unknown User',
            email: ticket.profiles?.[0]?.email || 'No email provided',
            subject: ticket.subject,
            date: new Date(ticket.created_at).toISOString().split('T')[0],
            status: ticket.status,
            priority: ticket.type === 'urgent' ? 'High' : ticket.type === 'question' ? 'Medium' : 'Low',
          }));
          
          setTickets(formattedTickets);
        }
      } catch (err: any) {
        console.error("Error fetching tickets:", err);
        toast({
          title: "Failed to load support tickets",
          description: err.message || "There was an error loading support ticket data",
          variant: "destructive"
        });
        setTickets([]);
      } finally {
        setIsLoadingTickets(false);
      }
    };
    
    fetchInvoices();
    fetchTickets();
  }, [toast]);
  
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

  const handleCreatePaymentLink = async () => {
    if (!newInvoice.amount || !newInvoice.customer) {
      toast({
        title: "Missing information",
        description: "Please provide at least a customer name and amount",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingPaymentLink(true);
    
    try {
      const amountValue = parseFloat(newInvoice.amount);
      
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Please enter a valid amount");
      }
      
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: {
          action: 'create-payment-link',
          amount: amountValue,
          description: newInvoice.description || "Fitness Training Services",
          customerEmail: newInvoice.email,
          customerName: newInvoice.customer
        },
      });
      
      if (error) throw new Error(error.message);
      
      if (data && data.url) {
        setPaymentLinkUrl(data.url);
        toast({
          title: "Payment Link Created",
          description: "The payment link has been successfully created",
        });
      } else {
        throw new Error("No payment link returned from the server");
      }
    } catch (err: any) {
      console.error("Error creating payment link:", err);
      toast({
        title: "Failed to create payment link",
        description: err.message || "There was an error creating the payment link",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPaymentLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLinkUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSendInvoice = async () => {
    toast({
      title: "Invoice Sent",
      description: `Payment link has been sent to ${newInvoice.email}`,
    });
    setShowNewInvoiceDialog(false);
    setPaymentLinkUrl("");
    setNewInvoice({
      customer: "",
      email: "",
      amount: "",
      description: "",
      dueDate: ""
    });
  };

  const handleSendReply = async () => {
    if (!ticketReply.trim() || !selectedTicket) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply message.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: ticketStatus.toLowerCase() })
        .eq('id', selectedTicket.id);
        
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${ticketStatus}.`,
      });
      
      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: ticketStatus } 
          : ticket
      ));
      
      setSelectedTicket({
        ...selectedTicket,
        status: ticketStatus
      });
      
      setTicketStatus("");
    } catch (err: any) {
      console.error("Error sending reply:", err);
      toast({
        title: "Failed to send reply",
        description: err.message || "There was an error sending your reply",
        variant: "destructive"
      });
    }
  };

  const handleViewInvoice = (invoice: InvoiceType) => {
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
                  {isLoadingInvoices ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index} className="border-[#353A48]">
                        <TableCell colSpan={6}>
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 rounded bg-[#353A48] animate-pulse"></div>
                            <div className="h-4 w-[80%] rounded bg-[#353A48] animate-pulse"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-[#353A48] hover:bg-[#2A2F3C]/50">
                        <TableCell className="font-medium">{invoice.id.substring(0, 8)}</TableCell>
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
                        {searchInvoice ? 
                          "No invoices found matching the search criteria." :
                          "No invoices available. Create a new invoice to get started."}
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
                  <DialogTitle className="text-xl">Invoice {selectedInvoice.id.substring(0, 8)}</DialogTitle>
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
                    <p className="text-sm">Fitness training services</p>
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
                  Create a payment link and send it to your client
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
                    placeholder="e.g. Personal training sessions (4) - Monthly fee"
                  />
                </div>
                
                {paymentLinkUrl && (
                  <div className="mt-4 p-4 bg-[#1A1F2C] rounded-md border border-[#353A48]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Payment Link</h4>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={handleCopyLink}
                        >
                          {linkCopied ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                          {linkCopied ? "Copied" : "Copy"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => window.open(paymentLinkUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 break-all">{paymentLinkUrl}</p>
                    
                    <div className="mt-4 pt-4 border-t border-[#353A48] flex justify-between">
                      <p className="text-sm text-gray-400">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Ready to send this payment link to the client?
                      </p>
                      <Button size="sm" onClick={handleSendInvoice}>
                        <Send className="h-4 w-4 mr-1" />
                        Send to Client
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewInvoiceDialog(false);
                    setPaymentLinkUrl("");
                    setNewInvoice({
                      customer: "",
                      email: "",
                      amount: "",
                      description: "",
                      dueDate: ""
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePaymentLink}
                  disabled={isCreatingPaymentLink}
                >
                  {isCreatingPaymentLink ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Creating...
                    </>
                  ) : paymentLinkUrl ? "Update Link" : "Create Payment Link"}
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
                      {isLoadingTickets ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index} className="border-[#353A48]">
                            <TableCell colSpan={6}>
                              <div className="flex items-center space-x-2">
                                <div className="h-4 w-4 rounded bg-[#353A48] animate-pulse"></div>
                                <div className="h-4 w-[80%] rounded bg-[#353A48] animate-pulse"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                          <TableRow 
                            key={ticket.id} 
                            className={`border-[#353A48] cursor-pointer hover:bg-[#2A2F3C]/50 ${selectedTicket?.id === ticket.id ? 'bg-[#2A2F3C]/70' : ''}`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <TableCell className="font-medium">{ticket.id.substring(0, 8)}</TableCell>
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
                            {searchTicket ? 
                              "No tickets found matching the search criteria." :
                              "No support tickets available."}
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
                      <span>Ticket {selectedTicket.id.substring(0, 8)}</span>
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
