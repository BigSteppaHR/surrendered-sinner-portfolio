
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Search, Plus, Edit, CheckCircle, XCircle } from 'lucide-react';

interface UserSession {
  id: string;
  user_id: string;
  session_type: string;
  cost: number;
  session_time: string;
  location: string;
  is_paid: boolean;
  notes: string | null;
}

interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
}

const AdminSessions = () => {
  const [sessions, setSessions] = useState<(UserSession & { user_email?: string; user_name?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState({
    sessionType: '',
    cost: '',
    sessionTime: '',
    location: '',
    isPaid: false,
    notes: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch all sessions and users
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('*')
          .order('session_time', { ascending: false });
          
        if (sessionsError) throw sessionsError;
        
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, email, full_name');
          
        if (usersError) throw usersError;
        
        setUsers(usersData || []);
        
        // Combine sessions with user details
        const enrichedSessions = (sessionsData || []).map(session => {
          const user = usersData?.find(u => u.id === session.user_id);
          return {
            ...session,
            user_email: user?.email || 'Unknown',
            user_name: user?.full_name || 'Unknown'
          };
        });
        
        setSessions(enrichedSessions);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Failed to load data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.user_email?.toLowerCase().includes(searchLower) ||
      session.user_name?.toLowerCase().includes(searchLower) ||
      session.session_type.toLowerCase().includes(searchLower) ||
      session.location.toLowerCase().includes(searchLower)
    );
  });

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user || null);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isPaid: e.target.checked
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.sessionType || !formData.cost || !formData.sessionTime || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          user_id: selectedUser.id,
          session_type: formData.sessionType,
          cost: parseFloat(formData.cost),
          session_time: new Date(formData.sessionTime).toISOString(),
          location: formData.location,
          is_paid: formData.isPaid,
          notes: formData.notes || null
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add user details to the new session
      const newSession = {
        ...data,
        user_email: selectedUser.email,
        user_name: selectedUser.full_name || 'Unknown'
      };
      
      // Update sessions list
      setSessions([newSession, ...sessions]);
      
      // Reset form
      setFormData({
        sessionType: '',
        cost: '',
        sessionTime: '',
        location: '',
        isPaid: false,
        notes: ''
      });
      
      setSelectedUser(null);
      setIsDialogOpen(false);
      
      toast({
        title: "Session created",
        description: "The session has been added successfully",
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Failed to create session",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggling payment status
  const handleTogglePayment = async (session: UserSession) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_paid: !session.is_paid })
        .eq('id', session.id);
        
      if (error) throw error;
      
      // Update local state
      setSessions(sessions.map(s => 
        s.id === session.id ? { ...s, is_paid: !session.is_paid } : s
      ));
      
      toast({
        title: "Payment status updated",
        description: `Session marked as ${!session.is_paid ? 'paid' : 'unpaid'}`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Failed to update payment status",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Session Management</h1>
      
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users, session types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-900 border-gray-800 w-[300px]"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Session</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new training session for a user.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <select
                  id="user"
                  value={selectedUser?.id || ''}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || 'No Name'} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type</Label>
                <Input
                  id="sessionType"
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleInputChange}
                  placeholder="e.g., Personal Training, Nutrition Consultation"
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="isPaid">Payment Status</Label>
                  <div className="flex items-center h-10">
                    <input
                      id="isPaid"
                      name="isPaid"
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 mr-2"
                    />
                    <Label htmlFor="isPaid" className="mb-0">Mark as paid</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTime">Date & Time</Label>
                <Input
                  id="sessionTime"
                  name="sessionTime"
                  type="datetime-local"
                  value={formData.sessionTime}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Gym, Virtual"
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes..."
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                  {isSubmitting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    'Create Session'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription className="text-gray-400">
            Manage all user training sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Session Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{session.user_name}</div>
                          <div className="text-sm text-gray-400">{session.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{session.session_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(session.session_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {formatTime(session.session_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {session.location}
                        </div>
                      </TableCell>
                      <TableCell>${session.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={session.is_paid ? "secondary" : "outline"}>
                          {session.is_paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleTogglePayment(session)}
                            title={session.is_paid ? "Mark as Unpaid" : "Mark as Paid"}
                          >
                            {session.is_paid ? (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Edit Session"
                          >
                            <Edit className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No sessions found.</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try adjusting your search criteria.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSessions;
