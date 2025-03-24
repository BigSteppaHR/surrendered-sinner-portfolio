
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MoreHorizontal, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  type: 'inquiry' | 'call_request';
  status: 'open' | 'in_progress' | 'closed';
  priority: string;
  created_at: string;
  updated_at: string;
  response_time?: string | null;
  user_email?: string;
  user_name?: string;
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  response_text: string;
  responded_by: string;
  created_at: string;
}

const AdminTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketResponses(selectedTicketId);
    }
  }, [selectedTicketId]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      
      // Get tickets with user details
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles(
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedTickets = data.map(ticket => ({
          ...ticket,
          user_email: ticket.profiles?.email || 'Unknown',
          user_name: ticket.profiles?.full_name || 'Unknown User',
          priority: ticket.priority || (ticket.type === 'call_request' ? 'high' : 'medium')
        }));
        setTickets(formattedTickets);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching tickets",
        description: error.message || "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketResponses = async (ticketId: string) => {
    try {
      setIsLoadingResponses(true);
      
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setResponses(data);
      } else {
        setResponses([]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching responses",
        description: error.message || "Failed to load ticket responses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const updateTicketStatus = async (id: string, status: 'open' | 'in_progress' | 'closed') => {
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      const now = new Date().toISOString();
      
      // Store response time if status is changed to in_progress from open
      const currentTicket = tickets.find(t => t.id === id);
      const updateData: any = { 
        status, 
        updated_at: now,
        last_updated_by: userId
      };
      
      // If status changed to in_progress and was previously open, save response time
      if (status === 'in_progress' && currentTicket?.status === 'open') {
        updateData.response_time = now;
      }
      
      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Record the status change as a system response
      await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: id,
          response_text: `Status changed to ${status}`,
          responded_by: userId
        });
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === id ? { ...ticket, status, updated_at: now } : ticket
        )
      );
      
      // If this is the selected ticket, refresh responses
      if (selectedTicketId === id) {
        fetchTicketResponses(id);
      }
      
      toast({
        title: "Ticket updated",
        description: `Ticket status changed to ${status.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating ticket",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const getFilteredTickets = () => {
    switch (activeTab) {
      case "open":
        return tickets.filter(ticket => ticket.status === 'open');
      case "in_progress":
        return tickets.filter(ticket => ticket.status === 'in_progress');
      case "closed":
        return tickets.filter(ticket => ticket.status === 'closed');
      case "calls":
        return tickets.filter(ticket => ticket.type === 'call_request');
      case "inquiries":
        return tickets.filter(ticket => ticket.type === 'inquiry');
      case "high_priority":
        return tickets.filter(ticket => ticket.priority === 'high');
      default:
        return tickets;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'closed':
        return <Badge className="bg-green-500 hover:bg-green-600">Closed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <Badge variant="outline" className="border-purple-500 text-purple-500"><MessageSquare className="w-3 h-3 mr-1" /> Inquiry</Badge>;
      case 'call_request':
        return <Badge variant="outline" className="border-orange-500 text-orange-500"><Phone className="w-3 h-3 mr-1" /> Call Request</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="border-red-500 text-red-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>;
      default:
        return <Badge variant="outline">Medium</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getResponseTime = (ticket: Ticket) => {
    if (!ticket.response_time) {
      return "Not responded yet";
    }
    
    const responseTime = new Date(ticket.response_time);
    const createdTime = new Date(ticket.created_at);
    
    // Calculate difference in milliseconds
    const diffMs = responseTime.getTime() - createdTime.getTime();
    
    // Convert to minutes and hours
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      
      if (remainingMinutes === 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      } else {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
    }
  };

  const getSelectedTicket = () => {
    return tickets.find(ticket => ticket.id === selectedTicketId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Button onClick={fetchTickets} variant="outline" disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="calls">Call Requests</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="high_priority">High Priority</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : getFilteredTickets().length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                <p className="text-gray-400">No tickets found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-4">
                {getFilteredTickets().map(ticket => (
                  <Card 
                    key={ticket.id} 
                    className={`bg-gray-900 border-gray-800 cursor-pointer transition-colors hover:bg-gray-800 ${selectedTicketId === ticket.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base mb-1">
                            {ticket.subject}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {getTypeBadge(ticket.type)}
                            <span className="text-gray-400 text-xs">
                              from {ticket.user_name}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3">
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(ticket.created_at)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getResponseTime(ticket)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="lg:col-span-2">
                {selectedTicketId ? (
                  <Card className="bg-gray-900 border-gray-800">
                    {getSelectedTicket() && (
                      <>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusBadge(getSelectedTicket()!.status)}
                                {getPriorityBadge(getSelectedTicket()!.priority)}
                                {getTypeBadge(getSelectedTicket()!.type)}
                              </div>
                              <CardTitle>{getSelectedTicket()!.subject}</CardTitle>
                              <CardDescription className="mt-1">
                                From {getSelectedTicket()!.user_name} ({getSelectedTicket()!.user_email})
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-800" />
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 text-blue-400 focus:text-blue-400" 
                                  onClick={() => updateTicketStatus(getSelectedTicket()!.id, 'open')}
                                >
                                  <Clock className="h-4 w-4" /> Mark as Open
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 text-yellow-400 focus:text-yellow-400" 
                                  onClick={() => updateTicketStatus(getSelectedTicket()!.id, 'in_progress')}
                                >
                                  <Clock className="h-4 w-4" /> Mark In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 text-green-400 focus:text-green-400" 
                                  onClick={() => updateTicketStatus(getSelectedTicket()!.id, 'closed')}
                                >
                                  <CheckCircle className="h-4 w-4" /> Close Ticket
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-800 rounded-md">
                              <h3 className="text-sm font-medium mb-2">Initial Message</h3>
                              <p className="text-sm whitespace-pre-wrap text-gray-300">{getSelectedTicket()!.message}</p>
                              <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                                <span>Created: {formatDate(getSelectedTicket()!.created_at)}</span>
                              </div>
                            </div>
                            
                            {isLoadingResponses ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                              </div>
                            ) : responses.length > 0 ? (
                              <div className="space-y-3">
                                <h3 className="text-sm font-medium">Responses</h3>
                                {responses.map(response => (
                                  <div key={response.id} className="p-3 bg-gray-800 rounded-md">
                                    <p className="text-sm whitespace-pre-wrap text-gray-300">{response.response_text}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                      <span>Responded: {formatDate(response.created_at)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 bg-gray-800 rounded-md text-center text-gray-400">
                                <p>No responses yet</p>
                              </div>
                            )}
                            
                            <div className="flex space-x-2 pt-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => updateTicketStatus(getSelectedTicket()!.id, 'in_progress')}
                                disabled={getSelectedTicket()!.status === 'in_progress'}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                In Progress
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => updateTicketStatus(getSelectedTicket()!.id, 'closed')}
                                disabled={getSelectedTicket()!.status === 'closed'}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Close Ticket
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ) : (
                  <Card className="bg-gray-900 border-gray-800 h-full flex items-center justify-center">
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400">Select a ticket to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTickets;
