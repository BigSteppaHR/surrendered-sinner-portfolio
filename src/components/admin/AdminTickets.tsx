
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  TicketIcon, 
  MessageSquare, 
  Clock, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Send 
} from 'lucide-react';
import { Input } from "@/components/ui/input";

type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  type: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
};

type TicketResponse = {
  id: string;
  ticket_id: string;
  response_text: string;
  responded_by: string;
  created_at: string;
  responder?: {
    email: string;
    full_name?: string;
  };
};

const AdminTickets = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_id (
            email:email,
            full_name:full_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (ticketsError) throw ticketsError;
      
      setTickets(ticketsData || []);
      setFilteredTickets(ticketsData || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error fetching tickets",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    // Filter tickets based on search query and status
    let filtered = [...tickets];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(query) || 
        ticket.message.toLowerCase().includes(query) ||
        (ticket.user?.email && ticket.user.email.toLowerCase().includes(query)) ||
        (ticket.user?.full_name && ticket.user.full_name.toLowerCase().includes(query))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    setFilteredTickets(filtered);
  }, [searchQuery, statusFilter, tickets]);

  const handleViewTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
    
    try {
      const { data: responsesData, error: responsesError } = await supabase
        .from('support_ticket_responses')
        .select(`
          *,
          responder:responded_by (
            email:email,
            full_name:full_name
          )
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });
        
      if (responsesError) throw responsesError;
      
      setResponses(responsesData || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Error fetching responses",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', selectedTicket.id);
        
      if (error) throw error;
      
      // Update local state
      setSelectedTicket({
        ...selectedTicket,
        status: status as 'open' | 'in_progress' | 'closed'
      });
      
      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: status as 'open' | 'in_progress' | 'closed' } 
          : ticket
      ));
      
      toast({
        title: "Status updated",
        description: `Ticket status set to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResponse = async () => {
    if (!user || !selectedTicket || !newResponse.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .insert([{
          ticket_id: selectedTicket.id,
          response_text: newResponse,
          responded_by: user.id
        }])
        .select(`
          *,
          responder:responded_by (
            email:email,
            full_name:full_name
          )
        `);
        
      if (error) throw error;
      
      if (data) {
        setResponses([...responses, data[0]]);
        setNewResponse("");
        
        // Also update the ticket status to in_progress if it's currently open
        if (selectedTicket.status === 'open') {
          await handleStatusChange('in_progress');
        }
        
        toast({
          title: "Response sent",
          description: "Your response has been sent to the user",
        });
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Error sending response",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-black';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <AlertCircle className="h-4 w-4" />;
      case 'billing': return <TicketIcon className="h-4 w-4" />;
      case 'account': return <AlertCircle className="h-4 w-4" />;
      case 'feature': return <AlertCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Badge variant="outline" className="bg-sinner-red/10 text-sinner-red border-sinner-red/20">
          Admin Portal
        </Badge>
      </div>

      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 text-sinner-red mr-2" />
            Support Tickets Management
          </CardTitle>
          <CardDescription>Manage customer support requests and inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9 bg-[#1A1A1A] border-[#333333]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-[#1A1A1A] border-[#333333]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333333]">
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 bg-[#1A1A1A]">
                <TabsTrigger 
                  value="table" 
                  className="data-[state=active]:bg-sinner-red data-[state=active]:text-white"
                >
                  Table View
                </TabsTrigger>
                <TabsTrigger 
                  value="cards" 
                  className="data-[state=active]:bg-sinner-red data-[state=active]:text-white"
                >
                  Card View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
                {isLoading ? (
                  <div className="flex justify-center items-center h-60">
                    <Clock className="h-10 w-10 animate-spin text-sinner-red" />
                  </div>
                ) : filteredTickets.length > 0 ? (
                  <div className="rounded-md border border-[#333333]">
                    <Table>
                      <TableHeader className="bg-[#1A1A1A]">
                        <TableRow className="border-[#333333] hover:bg-[#1A1A1A]">
                          <TableHead className="text-white">Subject</TableHead>
                          <TableHead className="text-white">User</TableHead>
                          <TableHead className="text-white">Type</TableHead>
                          <TableHead className="text-white">Priority</TableHead>
                          <TableHead className="text-white">Status</TableHead>
                          <TableHead className="text-white">Date</TableHead>
                          <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map((ticket) => (
                          <TableRow key={ticket.id} className="border-[#333333] hover:bg-[#1A1A1A]">
                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                            <TableCell>
                              {ticket.user?.full_name || ticket.user?.email || 'Unknown User'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getTypeIcon(ticket.type)}
                                <span className="ml-1 capitalize">{ticket.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-400">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTicket(ticket)}
                                className="border-sinner-red text-sinner-red hover:bg-sinner-red/10"
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-60">
                    <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
                    <h3 className="text-lg font-medium mb-1">No tickets found</h3>
                    <p className="text-sm text-gray-400">
                      {searchQuery || statusFilter !== 'all'
                        ? "No tickets match your search criteria"
                        : "There are no support tickets in the system"}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="cards">
                {isLoading ? (
                  <div className="flex justify-center items-center h-60">
                    <Clock className="h-10 w-10 animate-spin text-sinner-red" />
                  </div>
                ) : filteredTickets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTickets.map((ticket) => (
                      <Card 
                        key={ticket.id} 
                        className="bg-[#1A1A1A] border-[#333333] cursor-pointer hover:border-[#444444] transition-colors"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{ticket.subject}</CardTitle>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <CardDescription className="text-gray-400">
                            {ticket.user?.full_name || ticket.user?.email || 'Unknown User'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <p className="text-sm text-gray-300 mb-3 line-clamp-2">{ticket.message}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-[#444444]">
                                {ticket.type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-60">
                    <AlertCircle className="h-10 w-10 text-gray-500 mb-2" />
                    <h3 className="text-lg font-medium mb-1">No tickets found</h3>
                    <p className="text-sm text-gray-400">
                      {searchQuery || statusFilter !== 'all'
                        ? "No tickets match your search criteria"
                        : "There are no support tickets in the system"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="bg-[#111111] border-[#333333] text-white max-w-4xl">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center justify-between">
                  <span>{selectedTicket.subject}</span>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={handleStatusChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-[130px] h-8 bg-[#1A1A1A] border-[#333333]">
                        <Badge className={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status.replace('_', ' ')}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333333]">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DialogTitle>
                <DialogDescription className="flex justify-between items-center">
                  <div>
                    From: <span className="text-white">{selectedTicket.user?.full_name || selectedTicket.user?.email || 'Unknown User'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority} priority
                    </Badge>
                    <Badge variant="outline" className="border-[#444444]">
                      {selectedTicket.type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(selectedTicket.created_at)}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="bg-[#1A1A1A] p-4 rounded-md mb-4 border border-[#333333]">
                <p>{selectedTicket.message}</p>
              </div>
              
              <div className="mb-2 font-medium">Conversation History:</div>
              <ScrollArea className="h-[240px] pr-4 mb-4">
                {responses.length > 0 ? (
                  <div className="space-y-3">
                    {responses.map((response) => {
                      const isAdminResponse = response.responded_by !== selectedTicket.user_id;
                      return (
                        <div 
                          key={response.id} 
                          className={`p-3 rounded-md ${
                            isAdminResponse 
                              ? 'bg-sinner-red/10 border border-sinner-red/20 ml-6' 
                              : 'bg-[#1A1A1A] border border-[#333333] mr-6'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">
                              {isAdminResponse 
                                ? (response.responder?.full_name || 'Admin') 
                                : (selectedTicket.user?.full_name || 'User')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(response.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{response.response_text}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                    <p>No responses yet.</p>
                  </div>
                )}
              </ScrollArea>
              
              <div className="space-y-2">
                <Label htmlFor="response" className="font-medium">
                  Your Response:
                </Label>
                <Textarea
                  id="response"
                  placeholder="Type your response here..."
                  className="min-h-[100px] bg-[#1A1A1A] border-[#333333]"
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  disabled={selectedTicket.status === 'closed'}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsTicketDialogOpen(false)}
                  className="border-[#333333]"
                >
                  Close
                </Button>
                {selectedTicket.status !== 'closed' && (
                  <Button
                    onClick={handleSendResponse}
                    className="bg-sinner-red hover:bg-sinner-red/80"
                    disabled={!newResponse.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Clock className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Response
                  </Button>
                )}
                {selectedTicket.status !== 'closed' && (
                  <Button
                    onClick={() => handleStatusChange('closed')}
                    variant="destructive"
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Close Ticket
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;
