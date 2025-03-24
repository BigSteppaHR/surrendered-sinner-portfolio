
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, Plus, Clock, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
};

type TicketResponse = {
  id: string;
  ticket_id: string;
  response_text: string;
  responded_by: string;
  created_at: string;
};

const DashboardSupportTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    type: 'general',
    priority: 'medium'
  });
  const [newResponse, setNewResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Failed to load tickets",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user, toast]);

  const handleCreateTicket = async () => {
    if (!user) return;
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a subject and message",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          subject: newTicket.subject,
          message: newTicket.message,
          type: newTicket.type,
          priority: newTicket.priority,
          status: 'open'
        }])
        .select();

      if (error) throw error;

      if (data) {
        setTickets([data[0], ...tickets]);
        setNewTicket({
          subject: '',
          message: '',
          type: 'general',
          priority: 'medium'
        });
        setIsNewTicketDialogOpen(false);
        toast({
          title: "Ticket created",
          description: "Your support ticket has been submitted"
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Failed to create ticket",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDetailOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Failed to load responses",
        description: "Please try again later",
        variant: "destructive"
      });
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
        .select();

      if (error) throw error;

      if (data) {
        setResponses([...responses, data[0]]);
        setNewResponse('');
        toast({
          title: "Response sent",
          description: "Your message has been sent to support"
        });
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Failed to send response",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-black';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 text-sinner-red mr-2" />
              Support Tickets
            </CardTitle>
            <CardDescription>Get help from our support team</CardDescription>
          </div>
          <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-sinner-red hover:bg-red-700">
                <Plus className="h-4 w-4 mr-1" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Submit a new ticket to get help from our support team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticket-subject" className="col-span-4">
                    Subject
                  </Label>
                  <Input
                    id="ticket-subject"
                    placeholder="Brief description of your issue"
                    className="col-span-4 bg-gray-800 border-gray-700"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticket-type" className="col-span-4">
                    Type
                  </Label>
                  <Select value={newTicket.type} onValueChange={(value) => setNewTicket({...newTicket, type: value})}>
                    <SelectTrigger className="col-span-4 bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Problem</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticket-priority" className="col-span-4">
                    Priority
                  </Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value as 'low' | 'medium' | 'high'})}>
                    <SelectTrigger className="col-span-4 bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticket-message" className="col-span-4">
                    Message
                  </Label>
                  <Textarea
                    id="ticket-message"
                    placeholder="Describe your issue in detail"
                    className="col-span-4 min-h-32 bg-gray-800 border-gray-700"
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewTicketDialogOpen(false)}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTicket} 
                  className="bg-sinner-red hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Clock className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <>Submit Ticket</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border border-gray-800 rounded-md animate-pulse">
                <div className="h-5 bg-gray-800 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-3"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-4 border border-gray-800 rounded-md hover:bg-gray-800/50 cursor-pointer transition"
                onClick={() => handleViewTicket(ticket)}
              >
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium">{ticket.subject}</h3>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2 line-clamp-1">{ticket.message}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(ticket.created_at)}
                  </div>
                  <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No support tickets</h3>
            <p className="text-sm text-gray-400 mb-4">
              You haven't created any support tickets yet.
            </p>
            <Button 
              onClick={() => setIsNewTicketDialogOpen(true)}
              className="bg-sinner-red hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Ticket
            </Button>
          </div>
        )}
      </CardContent>

      {/* Ticket Detail Dialog */}
      <Dialog open={isTicketDetailOpen} onOpenChange={setIsTicketDetailOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[550px]">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedTicket.subject}</span>
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="flex justify-between text-xs text-gray-400">
                  <span>Created: {formatDate(selectedTicket.created_at)}</span>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority} priority
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-gray-800 p-3 rounded-md mb-4 text-sm">
                {selectedTicket.message}
              </div>
              
              <div className="mb-2 text-sm font-medium">Conversation:</div>
              
              <ScrollArea className="h-[200px] p-1 mb-2">
                {responses.length > 0 ? (
                  <div className="space-y-3">
                    {responses.map((response) => {
                      const isUserResponse = response.responded_by === user?.id;
                      return (
                        <div 
                          key={response.id} 
                          className={`p-3 rounded-md text-sm ${isUserResponse 
                            ? 'bg-sinner-red/10 border border-sinner-red/20 ml-4' 
                            : 'bg-gray-800 border border-gray-700 mr-4'}`}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">
                              {isUserResponse ? 'You' : 'Support Team'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(response.created_at)}
                            </span>
                          </div>
                          <p>{response.response_text}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    No responses yet. We'll get back to you soon.
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex items-center space-x-2">
                <Textarea 
                  placeholder="Type your reply here..." 
                  className="flex-1 min-h-24 bg-gray-800 border-gray-700"
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                />
              </div>
            </>
          )}
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setIsTicketDetailOpen(false)}
              className="border-gray-700"
            >
              Close
            </Button>
            <Button
              onClick={handleSendResponse}
              className="bg-sinner-red hover:bg-red-700"
              disabled={!newResponse.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Clock className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DashboardSupportTickets;
