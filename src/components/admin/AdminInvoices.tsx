
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  MessageSquare,
  Download,
  Filter,
  ArrowUpDown,
  Eye
} from "lucide-react";

const invoices = [
  { id: "INV-001", customer: "John Doe", email: "john@example.com", amount: "$99.99", date: "2023-08-12", status: "Paid" },
  { id: "INV-002", customer: "Sarah Johnson", email: "sarah@example.com", amount: "$29.99", date: "2023-08-10", status: "Paid" },
  { id: "INV-003", customer: "Michael Brown", email: "michael@example.com", amount: "$249.99", date: "2023-08-09", status: "Pending" },
  { id: "INV-004", customer: "Emily Davis", email: "emily@example.com", amount: "$99.99", date: "2023-08-07", status: "Overdue" },
  { id: "INV-005", customer: "Robert Wilson", email: "robert@example.com", amount: "$29.99", date: "2023-08-05", status: "Paid" },
];

const tickets = [
  { id: "TIC-001", customer: "John Doe", email: "john@example.com", subject: "Billing issue with subscription", date: "2023-08-12", status: "Open", priority: "High" },
  { id: "TIC-002", customer: "Sarah Johnson", email: "sarah@example.com", subject: "Question about workout plan", date: "2023-08-10", status: "Closed", priority: "Medium" },
  { id: "TIC-003", customer: "Michael Brown", email: "michael@example.com", subject: "Can't access premium content", date: "2023-08-09", status: "In Progress", priority: "High" },
  { id: "TIC-004", customer: "Emily Davis", email: "emily@example.com", subject: "Request for custom plan", date: "2023-08-07", status: "Open", priority: "Low" },
  { id: "TIC-005", customer: "Robert Wilson", email: "robert@example.com", subject: "Payment method update", date: "2023-08-05", status: "Closed", priority: "Medium" },
];

const AdminInvoices = () => {
  const [searchInvoice, setSearchInvoice] = useState("");
  const [searchTicket, setSearchTicket] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
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
        return "bg-blue-500/20 text-blue-500";
      case "In Progress":
        return "bg-purple-500/20 text-purple-500";
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Invoices & Support</h1>
      
      <Tabs defaultValue="invoices">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Invoices</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  className="bg-gray-800 border-gray-700 pl-10 w-full sm:w-64"
                  placeholder="Search invoices..."
                  value={searchInvoice}
                  onChange={(e) => setSearchInvoice(e.target.value)}
                />
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
                  <TableRow className="border-gray-800">
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
                      <TableRow key={invoice.id} className="border-gray-800">
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
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
        </TabsContent>
        
        <TabsContent value="tickets" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Support Tickets</CardTitle>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      className="bg-gray-800 border-gray-700 pl-10 w-full sm:w-64"
                      placeholder="Search tickets..."
                      value={searchTicket}
                      onChange={(e) => setSearchTicket(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">All</Badge>
                    <Badge variant="outline" className="bg-transparent text-gray-400 hover:bg-gray-800">Open</Badge>
                    <Badge variant="outline" className="bg-transparent text-gray-400 hover:bg-gray-800">In Progress</Badge>
                    <Badge variant="outline" className="bg-transparent text-gray-400 hover:bg-gray-800">Closed</Badge>
                  </div>
                
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
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
                            className={`border-gray-800 cursor-pointer hover:bg-gray-800/50 ${selectedTicket?.id === ticket.id ? 'bg-gray-800/70' : ''}`}
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
                <Card className="bg-gray-900 border-gray-800">
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
                      <div className="bg-gray-800 p-3 rounded-md text-sm">
                        <p>Hello,</p>
                        <p className="my-2">I'm having an issue with {selectedTicket.subject.toLowerCase()}. Could you please help me resolve this as soon as possible?</p>
                        <p>Thank you,</p>
                        <p>{selectedTicket.customer}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Reply</h4>
                      <textarea 
                        className="w-full h-32 bg-gray-800 border border-gray-700 rounded-md p-3 text-sm"
                        placeholder="Type your response here..."
                      ></textarea>
                      <div className="mt-2 flex justify-between">
                        <select className="text-xs bg-gray-800 border border-gray-700 rounded-md p-2">
                          <option value="">Update Status</option>
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                        <Button size="sm">Send Reply</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900 border-gray-800 h-full flex items-center justify-center text-gray-400">
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
