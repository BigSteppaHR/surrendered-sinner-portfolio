
import React, { useState, useEffect } from 'react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  type: string;
  priority: string;
  created_at: string;
  responses?: SupportTicketResponse[];
}

interface SupportTicketResponse {
  id: string;
  ticket_id: string;
  response_text: string;
  created_at: string;
  responded_by: string;
}

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketType, setTicketType] = useState('general');
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      // Fetch tickets with responses
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          responses:support_ticket_responses(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your support tickets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please fill out all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          subject,
          message,
          type: ticketType,
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new ticket to the list
      setTickets([data, ...tickets]);
      
      // Reset form
      setSubject('');
      setMessage('');
      setTicketType('general');
      
      toast({
        title: 'Ticket Submitted',
        description: 'Your support ticket has been created successfully',
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setError('Failed to submit your ticket. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to submit your support ticket',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyToTicket = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter your reply message',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          response_text: replyMessage,
          responded_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the selected ticket with the new response
      const updatedTicket = {
        ...selectedTicket,
        responses: [...(selectedTicket.responses || []), data]
      };
      
      // Update the tickets list
      const updatedTickets = tickets.map(ticket => 
        ticket.id === selectedTicket.id ? updatedTicket : ticket
      );
      
      setTickets(updatedTickets);
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
      
      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent successfully',
      });
    } catch (error) {
      console.error('Error replying to ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to send your reply',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ticketTypeOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feedback', label: 'Feedback' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-600">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-600">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-600">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-600">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Support Center</h1>
            <p className="text-gray-400">Get help and support for your fitness journey</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-sinner-red mr-2" />
                    Create New Ticket
                  </CardTitle>
                  <CardDescription>Get help with your question or issue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-950 border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="ticket-type">Ticket Type</Label>
                    <Select value={ticketType} onValueChange={setTicketType}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {ticketTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your issue"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue in detail"
                      className="bg-zinc-800 border-zinc-700 min-h-[150px]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSubmitTicket}
                    disabled={isSubmitting}
                    className="w-full bg-sinner-red hover:bg-red-700"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : 'Submit Ticket'}
                  </Button>
                </CardFooter>
              </Card>
              
              {!isLoading && tickets.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Your Tickets</CardTitle>
                    <CardDescription>View your support ticket history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[400px] overflow-y-auto p-0">
                    {tickets.map(ticket => (
                      <div 
                        key={ticket.id}
                        className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-zinc-800' : ''}`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-sm">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{ticket.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {ticket.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              {selectedTicket ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedTicket.subject}</CardTitle>
                        <CardDescription>
                          {new Date(selectedTicket.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(selectedTicket.status)}
                        <Badge variant="outline">{selectedTicket.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-sinner-red/20 rounded-full flex items-center justify-center mr-2">
                            <span className="text-sm font-semibold text-sinner-red">
                              {user?.email?.[0].toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">You</p>
                            <p className="text-xs text-gray-400">
                              {new Date(selectedTicket.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm ml-10">{selectedTicket.message}</p>
                      </div>
                      
                      {selectedTicket.responses && selectedTicket.responses.map(response => (
                        <div key={response.id} className="bg-zinc-800 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center mr-2">
                              <span className="text-sm font-semibold text-white">
                                {response.responded_by === user?.id ? 'Y' : 'S'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {response.responded_by === user?.id ? 'You' : 'Support Team'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(response.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm ml-10">{response.response_text}</p>
                        </div>
                      ))}
                      
                      {selectedTicket.status !== 'closed' && (
                        <div className="space-y-4 mt-6">
                          <Textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply here..."
                            className="bg-zinc-800 border-zinc-700"
                          />
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleReplyToTicket}
                              disabled={isSubmitting || !replyMessage.trim()}
                              className="bg-sinner-red hover:bg-red-700"
                            >
                              {isSubmitting ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : 'Send Reply'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center bg-zinc-900 rounded-lg p-10 text-center">
                  <div>
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Select a Ticket</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Click on a ticket from the list to view details and conversation history
                      or create a new ticket for help with your fitness journey.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
