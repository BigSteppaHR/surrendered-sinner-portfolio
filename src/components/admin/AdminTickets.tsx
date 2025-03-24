
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
  Clock
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
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

const AdminTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      
      // Get tickets with user details
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (
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
          user_name: ticket.profiles?.full_name || 'Unknown User'
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

  const updateTicketStatus = async (id: string, status: 'open' | 'in_progress' | 'closed') => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === id ? { ...ticket, status } : ticket
        )
      );
      
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Button onClick={fetchTickets} variant="outline" disabled={isLoading}>
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
            getFilteredTickets().map(ticket => (
              <Card key={ticket.id} className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {ticket.subject}
                        <span className="ml-3">
                          {getStatusBadge(ticket.status)}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        {getTypeBadge(ticket.type)}
                        <span className="text-gray-400">
                          from {ticket.user_name} ({ticket.user_email})
                        </span>
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
                          onClick={() => updateTicketStatus(ticket.id, 'open')}
                        >
                          <Clock className="h-4 w-4" /> Mark as Open
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-yellow-400 focus:text-yellow-400" 
                          onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        >
                          <Clock className="h-4 w-4" /> Mark In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-green-400 focus:text-green-400" 
                          onClick={() => updateTicketStatus(ticket.id, 'closed')}
                        >
                          <CheckCircle className="h-4 w-4" /> Close Ticket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm whitespace-pre-wrap text-gray-300">{ticket.message}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {formatDate(ticket.created_at)}</span>
                      <span>Updated: {formatDate(ticket.updated_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTickets;
