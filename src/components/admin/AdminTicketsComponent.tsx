import { useState } from "react";
import { 
  CalendarDays, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Mail, 
  MessageSquare, 
  MoreHorizontal, 
  Search, 
  User,
  CheckCircle,
  AlertCircle,
  Clock3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock ticket data
const mockTickets = [
  {
    id: "T-1234",
    subject: "Payment not processed correctly",
    status: "open",
    priority: "high",
    created_at: "2023-10-15T14:30:00Z",
    updated_at: "2023-10-16T09:15:00Z",
    user: {
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: null
    },
    messages: [
      {
        id: "M-1",
        author: "user",
        content: "I made a payment for my monthly subscription but it's still showing as unpaid in my account. The payment was confirmed by my bank.",
        created_at: "2023-10-15T14:30:00Z"
      },
      {
        id: "M-2",
        author: "admin",
        content: "I'll check your payment status right away. Can you provide the transaction reference from your bank?",
        created_at: "2023-10-16T09:15:00Z"
      }
    ]
  },
  {
    id: "T-1235",
    subject: "Scheduling session problem",
    status: "pending",
    priority: "medium",
    created_at: "2023-10-14T10:22:00Z",
    updated_at: "2023-10-15T11:45:00Z",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatar: null
    },
    messages: [
      {
        id: "M-3",
        author: "user",
        content: "I'm trying to schedule a session for next week but the calendar isn't showing any available slots.",
        created_at: "2023-10-14T10:22:00Z"
      },
      {
        id: "M-4",
        author: "admin",
        content: "Thanks for reporting this. I've checked and there was a sync issue with our calendar system. It should be working now. Can you try again and let me know if you still have issues?",
        created_at: "2023-10-15T11:45:00Z"
      }
    ]
  },
  {
    id: "T-1236",
    subject: "Training plan access",
    status: "closed",
    priority: "low",
    created_at: "2023-10-10T08:15:00Z",
    updated_at: "2023-10-11T16:30:00Z",
    user: {
      name: "Mike Wilson",
      email: "mike.w@example.com",
      avatar: null
    },
    messages: [
      {
        id: "M-5",
        author: "user",
        content: "I purchased the premium training plan but I can't access all the workouts. Only the first week is visible.",
        created_at: "2023-10-10T08:15:00Z"
      },
      {
        id: "M-6",
        author: "admin",
        content: "I've checked your account and there was an issue with the plan assignment. I've fixed it now, and you should have full access to all weeks of the premium plan.",
        created_at: "2023-10-11T13:20:00Z"
      },
      {
        id: "M-7",
        author: "user",
        content: "Thanks! I can see all the workouts now. Appreciate the quick help.",
        created_at: "2023-10-11T15:45:00Z"
      },
      {
        id: "M-8",
        author: "admin",
        content: "You're welcome! Let us know if you need anything else. Enjoy your training!",
        created_at: "2023-10-11T16:30:00Z"
      }
    ]
  }
];

const AdminTicketsComponent = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Filter tickets based on search query and active tab
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "open") return matchesSearch && ticket.status === "open";
    if (activeTab === "pending") return matchesSearch && ticket.status === "pending";
    if (activeTab === "closed") return matchesSearch && ticket.status === "closed";
    
    return matchesSearch;
  });

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    
    // Create a new message
    const newMessage = {
      id: `M-${Math.floor(Math.random() * 1000)}`,
      author: "admin",
      content: replyText,
      created_at: new Date().toISOString()
    };
    
    // Update the ticket with the new message
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          messages: [...ticket.messages, newMessage],
          updated_at: new Date().toISOString(),
          status: "pending" // Automatically change status to pending after admin reply
        };
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    
    // Update selected ticket to show the new message
    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      updated_at: new Date().toISOString(),
      status: "pending"
    });
    
    // Clear reply text
    setReplyText("");
    
    toast({
      title: "Reply sent",
      description: "Your response has been sent to the client."
    });
  };

  const updateTicketStatus = (ticketId: string, newStatus: string) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: newStatus,
          updated_at: new Date().toISOString()
        };
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        status: newStatus,
        updated_at: new Date().toISOString()
      });
    }
    
    toast({
      title: "Ticket updated",
      description: `Ticket status changed to ${newStatus}.`
    });
  };

  const updateTicketPriority = (ticketId: string, newPriority: string) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          priority: newPriority,
          updated_at: new Date().toISOString()
        };
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        priority: newPriority,
        updated_at: new Date().toISOString()
      });
    }
    
    toast({
      title: "Priority updated",
      description: `Ticket priority changed to ${newPriority}.`
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <Clock3 className="h-4 w-4 text-blue-500" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "pending":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "closed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "medium":
        return "bg-orange-500/10 text-orange-500";
      case "low":
        return "bg-gray-500/10 text-gray-400";
      default:
        return "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="py-6 px-8 border-b border-[#333333]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
            <p className="text-gray-400">Manage and respond to user support requests</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid lg:grid-cols-[350px_1fr] h-full">
          {/* Ticket List Panel */}
          <div className="border-r border-[#333333] h-full flex flex-col">
            <div className="p-4 border-b border-[#333333]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search tickets..."
                  className="pl-9 bg-[#1A1A1A] border-[#333333]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs 
              defaultValue="all" 
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <div className="border-b border-[#333333]">
                <TabsList className="w-full h-auto bg-transparent border-b border-[#333333] rounded-none p-0">
                  <TabsTrigger 
                    value="all" 
                    className="flex-1 py-3 rounded-none data-[state=active]:bg-[#1A1A1A] data-[state=active]:border-b-2 data-[state=active]:border-sinner-red data-[state=active]:shadow-none"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="open" 
                    className="flex-1 py-3 rounded-none data-[state=active]:bg-[#1A1A1A] data-[state=active]:border-b-2 data-[state=active]:border-sinner-red data-[state=active]:shadow-none"
                  >
                    Open
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="flex-1 py-3 rounded-none data-[state=active]:bg-[#1A1A1A] data-[state=active]:border-b-2 data-[state=active]:border-sinner-red data-[state=active]:shadow-none"
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="closed" 
                    className="flex-1 py-3 rounded-none data-[state=active]:bg-[#1A1A1A] data-[state=active]:border-b-2 data-[state=active]:border-sinner-red data-[state=active]:shadow-none"
                  >
                    Closed
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="m-0 overflow-auto h-[calc(100vh-13rem)]">
                {filteredTickets.length > 0 ? (
                  <div className="divide-y divide-[#333333]">
                    {filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        className={`w-full text-left p-4 hover:bg-[#1A1A1A] transition-colors ${
                          selectedTicket?.id === ticket.id ? "bg-[#1A1A1A]" : ""
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9 border border-[#333333]">
                              <AvatarImage src={ticket.user.avatar || ""} alt={ticket.user.name} />
                              <AvatarFallback className="bg-sinner-red/20 text-sinner-red">
                                {getInitials(ticket.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white">{ticket.user.name}</span>
                                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                  {getStatusIcon(ticket.status)}
                                  <span className="ml-1 capitalize">{ticket.status}</span>
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-400 truncate max-w-[180px]">
                                {ticket.id}: {ticket.subject}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(ticket.updated_at)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {ticket.messages.length}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No tickets found</h3>
                    <p className="text-gray-400 mt-1">
                      {searchQuery ? "Try a different search term" : "All support tickets will appear here"}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="open" className="m-0 overflow-auto h-[calc(100vh-13rem)]">
                {filteredTickets.length > 0 ? (
                  <div className="divide-y divide-[#333333]">
                    {filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        className={`w-full text-left p-4 hover:bg-[#1A1A1A] transition-colors ${
                          selectedTicket?.id === ticket.id ? "bg-[#1A1A1A]" : ""
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9 border border-[#333333]">
                              <AvatarImage src={ticket.user.avatar || ""} alt={ticket.user.name} />
                              <AvatarFallback className="bg-sinner-red/20 text-sinner-red">
                                {getInitials(ticket.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white">{ticket.user.name}</span>
                                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                  {getStatusIcon(ticket.status)}
                                  <span className="ml-1 capitalize">{ticket.status}</span>
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-400 truncate max-w-[180px]">
                                {ticket.id}: {ticket.subject}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(ticket.updated_at)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {ticket.messages.length}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No open tickets</h3>
                    <p className="text-gray-400 mt-1">
                      {searchQuery ? "Try a different search term" : "Open support tickets will appear here"}
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="pending" className="m-0 overflow-auto h-[calc(100vh-13rem)]">
                {filteredTickets.length > 0 ? (
                  <div className="divide-y divide-[#333333]">
                    {filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        className={`w-full text-left p-4 hover:bg-[#1A1A1A] transition-colors ${
                          selectedTicket?.id === ticket.id ? "bg-[#1A1A1A]" : ""
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9 border border-[#333333]">
                              <AvatarImage src={ticket.user.avatar || ""} alt={ticket.user.name} />
                              <AvatarFallback className="bg-sinner-red/20 text-sinner-red">
                                {getInitials(ticket.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white">{ticket.user.name}</span>
                                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                  {getStatusIcon(ticket.status)}
                                  <span className="ml-1 capitalize">{ticket.status}</span>
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-400 truncate max-w-[180px]">
                                {ticket.id}: {ticket.subject}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(ticket.updated_at)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {ticket.messages.length}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No pending tickets</h3>
                    <p className="text-gray-400 mt-1">
                      {searchQuery ? "Try a different search term" : "Pending support tickets will appear here"}
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="closed" className="m-0 overflow-auto h-[calc(100vh-13rem)]">
                {filteredTickets.length > 0 ? (
                  <div className="divide-y divide-[#333333]">
                    {filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        className={`w-full text-left p-4 hover:bg-[#1A1A1A] transition-colors ${
                          selectedTicket?.id === ticket.id ? "bg-[#1A1A1A]" : ""
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9 border border-[#333333]">
                              <AvatarImage src={ticket.user.avatar || ""} alt={ticket.user.name} />
                              <AvatarFallback className="bg-sinner-red/20 text-sinner-red">
                                {getInitials(ticket.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white">{ticket.user.name}</span>
                                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                  {getStatusIcon(ticket.status)}
                                  <span className="ml-1 capitalize">{ticket.status}</span>
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-400 truncate max-w-[180px]">
                                {ticket.id}: {ticket.subject}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(ticket.updated_at)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {ticket.messages.length}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No closed tickets</h3>
                    <p className="text-gray-400 mt-1">
                      {searchQuery ? "Try a different search term" : "Closed support tickets will appear here"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Ticket Detail Panel */}
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-[#333333] flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span>{selectedTicket.id}</span>
                    <span>·</span>
                    <span>{selectedTicket.subject}</span>
                  </h2>
                  <div className="flex mt-1 text-sm text-gray-400 items-center">
                    <User className="h-3.5 w-3.5 mr-1" />
                    <span>{selectedTicket.user.name}</span>
                    <span className="mx-2">·</span>
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    <span>{selectedTicket.user.email}</span>
                    <span className="mx-2">·</span>
                    <CalendarDays className="h-3.5 w-3.5 mr-1" />
                    <span>Created on {formatDate(selectedTicket.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select 
                    defaultValue={selectedTicket.status}
                    onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    defaultValue={selectedTicket.priority}
                    onValueChange={(value) => updateTicketPriority(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-6">
                  {selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.author === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.author === "admin" 
                            ? "bg-sinner-red/10 text-white" 
                            : "bg-[#1A1A1A] text-white"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {message.author === "admin" ? "Support Team" : selectedTicket.user.name}
                          </span>
                          <div className="text-xs text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-[#333333]">
                <div className="flex flex-col">
                  <Textarea
                    placeholder="Type your reply here..."
                    className="min-h-[100px] bg-[#1A1A1A] border-[#333333] mb-3"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" className="border-[#333333] text-gray-400">
                      Save as Draft
                    </Button>
                    <Button 
                      className="bg-sinner-red hover:bg-red-700"
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                    >
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-white">No ticket selected</h3>
              <p className="text-gray-400 mt-2 max-w-md">
                Select a ticket from the list to view details and respond to the customer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsComponent;
