
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon, Pencil, Trash2, Eye, Plus, Check, X, Loader2, User } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Event {
  id?: string;
  title: string;
  description: string;
  date: Date | string;
  time: string;
  location: string;
  image_url: string;
  is_online: boolean;
  price: number;
  spots: number;
  spots_remaining: number;
  registration_url?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const { toast } = useToast();
  
  // Default new event template
  const defaultEvent: Event = {
    title: '',
    description: '',
    date: new Date(),
    time: '10:00 AM - 1:00 PM',
    location: '',
    image_url: '/placeholder.svg',
    is_online: false,
    price: 99.99,
    spots: 20,
    spots_remaining: 20,
    registration_url: ''
  };
  
  // Fetch all events
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch event registrations
  const fetchEventRegistrations = async (eventId: string) => {
    try {
      setLoadingRegistrations(true);
      
      // Implement this when you have the event_registrations table
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profiles(id, full_name, email)')
        .eq('event_id', eventId);
      
      if (error) throw error;
      
      setEventRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event registrations.',
        variant: 'destructive',
      });
      setEventRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };
  
  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);
  
  // Handle opening the event dialog
  const handleOpenDialog = (event: Event | null = null) => {
    if (event) {
      // Edit existing event - make sure the date is a Date object
      setSelectedEvent({
        ...event,
        date: new Date(event.date)
      });
    } else {
      // Create new event
      setSelectedEvent(defaultEvent);
    }
    setIsDialogOpen(true);
  };
  
  // Handle view registrations
  const handleViewRegistrations = (eventId: string) => {
    fetchEventRegistrations(eventId);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedEvent(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  // Handle special inputs (boolean, number, date)
  const handleSpecialInputChange = (name: string, value: any) => {
    setSelectedEvent(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  // Save event (create or update)
  const handleSaveEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!selectedEvent.title || !selectedEvent.date) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }
      
      // Format date for database
      const formattedEvent = {
        ...selectedEvent,
        date: new Date(selectedEvent.date).toISOString(),
        spots_remaining: selectedEvent.id 
          ? selectedEvent.spots_remaining 
          : selectedEvent.spots, // Set spots_remaining equal to spots for new events
      };
      
      let result;
      
      if (selectedEvent.id) {
        // Update existing event
        result = await supabase
          .from('events')
          .update(formattedEvent)
          .eq('id', selectedEvent.id)
          .select();
      } else {
        // Create new event
        result = await supabase
          .from('events')
          .insert(formattedEvent)
          .select();
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: selectedEvent.id ? 'Event Updated' : 'Event Created',
        description: selectedEvent.id 
          ? 'The event has been updated successfully.'
          : 'A new event has been created successfully.',
        variant: 'default',
      });
      
      // Refresh events list
      fetchEvents();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete an event
  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId || isDeleting) return;
    
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast({
        title: 'Event Deleted',
        description: 'The event has been deleted successfully.',
        variant: 'default',
      });
      
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Events Management</h1>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="bg-[#ea384c] hover:bg-[#c8313f]"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Event
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {events.map(event => (
              <Card key={event.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="h-4 w-4" /> 
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {event.time && ` • ${event.time}`}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className={event.is_online ? 'bg-blue-500/20' : 'bg-green-500/20'}>
                      {event.is_online ? 'Online' : 'In Person'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-gray-400">Location</Label>
                      <p className="text-sm">{event.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Price</Label>
                      <p className="text-sm">${parseFloat(event.price.toString()).toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Capacity</Label>
                      <p className="text-sm">{event.spots_remaining} / {event.spots} spots available</p>
                    </div>
                  </div>
                  
                  <Label className="text-xs text-gray-400">Description</Label>
                  <p className="text-sm line-clamp-2">{event.description}</p>
                </CardContent>
                
                <CardFooter className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewRegistrations(event.id!)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Registrations
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenDialog(event)}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteEvent(event.id!)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <CalendarIcon className="h-16 w-16 text-[#ea384c]/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Events Created Yet</h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              You haven't created any events yet. Add your first event to start accepting registrations.
            </p>
            <Button 
              onClick={() => handleOpenDialog()} 
              className="bg-[#ea384c] hover:bg-[#c8313f]"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Your First Event
            </Button>
          </div>
        )}
        
        {/* Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl overflow-hidden bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.id ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {selectedEvent?.id 
                  ? 'Update the details for this event.' 
                  : 'Enter the details to create a new event.'}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <div className="grid md:grid-cols-2 gap-4 p-1">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={selectedEvent?.title || ''}
                      onChange={handleInputChange}
                      placeholder="Enter event title"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={selectedEvent?.location || ''}
                      onChange={handleInputChange}
                      placeholder="Enter location or platform for online events"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedEvent?.date 
                            ? format(new Date(selectedEvent.date), 'PPP')
                            : <span>Pick a date</span>
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                        <Calendar
                          mode="single"
                          selected={selectedEvent?.date ? new Date(selectedEvent.date) : undefined}
                          onSelect={(date) => handleSpecialInputChange('date', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Event Time</Label>
                    <Input
                      id="time"
                      name="time"
                      value={selectedEvent?.time || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 10:00 AM - 1:00 PM"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedEvent?.is_online || false}
                      onCheckedChange={(checked) => handleSpecialInputChange('is_online', checked)}
                      id="is_online"
                    />
                    <Label htmlFor="is_online">This is an online event</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={selectedEvent?.price || 0}
                      onChange={handleInputChange}
                      placeholder="Enter price (0 for free events)"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="spots">Total Spots</Label>
                    <Input
                      id="spots"
                      name="spots"
                      type="number"
                      value={selectedEvent?.spots || 0}
                      onChange={handleInputChange}
                      placeholder="Enter total capacity"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  {selectedEvent?.id && (
                    <div>
                      <Label htmlFor="spots_remaining">Spots Remaining</Label>
                      <Input
                        id="spots_remaining"
                        name="spots_remaining"
                        type="number"
                        value={selectedEvent?.spots_remaining || 0}
                        onChange={handleInputChange}
                        placeholder="Enter spots remaining"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      value={selectedEvent?.image_url || ''}
                      onChange={handleInputChange}
                      placeholder="Enter image URL"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="registration_url">External Registration URL (Optional)</Label>
                    <Input
                      id="registration_url"
                      name="registration_url"
                      value={selectedEvent?.registration_url || ''}
                      onChange={handleInputChange}
                      placeholder="Enter URL if using an external registration system"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={selectedEvent?.description || ''}
                    onChange={handleInputChange}
                    placeholder="Enter event description"
                    className="min-h-[150px] bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEvent}
                disabled={isSubmitting}
                className="bg-[#ea384c] hover:bg-[#c8313f]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {selectedEvent?.id ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Event Registrations Dialog */}
        <Dialog onOpenChange={() => setEventRegistrations([])}>
          <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle>Event Registrations</DialogTitle>
              <DialogDescription>
                View all users registered for this event.
              </DialogDescription>
            </DialogHeader>
            
            {loadingRegistrations ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
              </div>
            ) : eventRegistrations.length > 0 ? (
              <ScrollArea className="max-h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>{registration.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{registration.profiles?.email || 'Unknown'}</TableCell>
                        <TableCell>
                          {new Date(registration.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={registration.status === 'confirmed' ? 'default' : 'secondary'}
                            className={registration.status === 'confirmed' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                            }
                          >
                            {registration.status || 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-[#ea384c]/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Registrations Yet</h3>
                <p className="text-gray-400">
                  No one has registered for this event yet.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
