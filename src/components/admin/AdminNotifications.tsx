
import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Clock, XCircle, AlertCircle, Filter, RefreshCw, Plus, Users, Calendar, Target, X, CreditCard, Loader2, ArrowUpDown, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

type Notification = {
  id: string;
  title: string;
  message: string;
  user_id?: string;
  is_read: boolean;
  read_at?: string;
  read_by?: string;
  notification_type: string;
  created_at: string;
  expires_at: string | null;
  priority?: string;
  source?: string;
  action_url?: string;
  user?: {
    email: string;
    full_name?: string;
  };
};

const notificationTypes = [
  { value: "info", label: "Information", color: "bg-blue-500" },
  { value: "success", label: "Success", color: "bg-green-500" },
  { value: "warning", label: "Warning", color: "bg-yellow-500" },
  { value: "error", label: "Error", color: "bg-red-500" }
];

const priorityLevels = [
  { value: "low", label: "Low", color: "bg-gray-500" },
  { value: "normal", label: "Normal", color: "bg-blue-500" },
  { value: "high", label: "High", color: "bg-yellow-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" }
];

interface User {
  id: string;
  email: string;
  full_name?: string;
}

const AdminNotifications = () => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState<'user' | 'admin'>('user');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    userId: "",
    expires: "",
    priority: "normal",
    global: false,
    action_url: ""
  });
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchUserNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("user_notifications")
        .select(`
          *,
          user:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setUserNotifications(data || []);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load user notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const fetchAdminNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("admin_notifications")
        .select(`*`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setAdminNotifications(data || []);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load admin notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUserNotifications();
      fetchAdminNotifications();
      fetchUsers();
      
      // Set up realtime subscription for notifications
      const userChannel = supabase
        .channel('user-notifications-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_notifications' }, 
          () => fetchUserNotifications()
        )
        .subscribe();
        
      const adminChannel = supabase
        .channel('admin-notifications-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'admin_notifications' }, 
          () => fetchAdminNotifications()
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(userChannel);
        supabase.removeChannel(adminChannel);
      };
    }
  }, [isAdmin, fetchUserNotifications, fetchAdminNotifications, fetchUsers]);

  const getCurrentNotifications = () => {
    return currentTab === 'user' ? userNotifications : adminNotifications;
  };

  const filteredNotifications = getCurrentNotifications().filter(notification => {
    // Search functionality
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.user?.email && notification.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (notification.source && notification.source.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter functionality
    if (filter === "all") return matchesSearch;
    if (filter === "read") return matchesSearch && notification.is_read;
    if (filter === "unread") return matchesSearch && !notification.is_read;
    if (filter === "expired") {
      const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();
      return matchesSearch && isExpired;
    }
    if (filter === "low" || filter === "normal" || filter === "high" || filter === "urgent") {
      return matchesSearch && notification.priority === filter;
    }
    if (filter === notificationTypes[0].value || 
        filter === notificationTypes[1].value || 
        filter === notificationTypes[2].value || 
        filter === notificationTypes[3].value) {
      return matchesSearch && notification.notification_type === filter;
    }
    
    return matchesSearch;
  });

  const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
    const table = currentTab === 'user' ? 'user_notifications' : 'admin_notifications';
    
    try {
      const updateData: any = { is_read: !currentStatus };
      
      // Add read_at timestamp and read_by user id if marking as read
      if (!currentStatus) {
        updateData.read_at = new Date().toISOString();
        if (currentTab === 'admin') {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            updateData.read_by = data.user.id;
          }
        }
      } else {
        // Clear read_at and read_by if marking as unread
        updateData.read_at = null;
        if (currentTab === 'admin') {
          updateData.read_by = null;
        }
      }
      
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      if (currentTab === 'user') {
        setUserNotifications(userNotifications.map(notif => 
          notif.id === id ? { ...notif, is_read: !currentStatus } : notif
        ));
      } else {
        setAdminNotifications(adminNotifications.map(notif => 
          notif.id === id ? { ...notif, is_read: !currentStatus } : notif
        ));
      }
      
      toast({
        title: "Success",
        description: `Notification marked as ${!currentStatus ? "read" : "unread"}`,
      });
    } catch (error) {
      console.error("Error updating notification:", error);
      toast({
        title: "Error",
        description: "Failed to update notification status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const table = currentTab === 'user' ? 'user_notifications' : 'admin_notifications';
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      if (currentTab === 'user') {
        setUserNotifications(userNotifications.filter(notif => notif.id !== id));
      } else {
        setAdminNotifications(adminNotifications.filter(notif => notif.id !== id));
      }
      
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const handleCreateNotification = async () => {
    try {
      if (!newNotification.title.trim() || !newNotification.message.trim()) {
        toast({
          title: "Error",
          description: "Title and message are required",
          variant: "destructive"
        });
        return;
      }
      
      setIsCreateDialogOpen(false);
      
      // For global notifications, we need to get all user IDs
      if (currentTab === 'user') {
        if (newNotification.global || selectAllUsers) {
          // Get all users
          const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("id");
          
          if (usersError) throw usersError;
          
          if (users && users.length > 0) {
            // Create notification for each user
            const notificationsToInsert = users.map(user => ({
              user_id: user.id,
              title: newNotification.title,
              message: newNotification.message,
              notification_type: newNotification.type,
              priority: newNotification.priority,
              action_url: newNotification.action_url || null,
              expires_at: newNotification.expires ? new Date(newNotification.expires).toISOString() : null
            }));
            
            const { error } = await supabase
              .from("user_notifications")
              .insert(notificationsToInsert);
            
            if (error) throw error;
            
            toast({
              title: "Success",
              description: `Global notification sent to ${users.length} users`
            });
            
            // Refresh notifications list
            fetchUserNotifications();
          }
        } else {
          // Single user notification
          if (!newNotification.userId) {
            toast({
              title: "Error",
              description: "User ID is required for single user notifications",
              variant: "destructive"
            });
            return;
          }
          
          const { error } = await supabase
            .from("user_notifications")
            .insert({
              user_id: newNotification.userId,
              title: newNotification.title,
              message: newNotification.message,
              notification_type: newNotification.type,
              priority: newNotification.priority,
              action_url: newNotification.action_url || null,
              expires_at: newNotification.expires ? new Date(newNotification.expires).toISOString() : null
            });
          
          if (error) throw error;
          
          toast({
            title: "Success",
            description: "Notification created successfully"
          });
          
          // Refresh notifications list
          fetchUserNotifications();
        }
      } else {
        // Admin notification
        const { error } = await supabase
          .from("admin_notifications")
          .insert({
            title: newNotification.title,
            message: newNotification.message,
            notification_type: newNotification.type,
            priority: newNotification.priority,
            action_url: newNotification.action_url || null,
            source: "admin-portal",
            expires_at: newNotification.expires ? new Date(newNotification.expires).toISOString() : null
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Admin notification created successfully"
        });
        
        // Refresh notifications list
        fetchAdminNotifications();
      }
      
      // Reset form
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        userId: "",
        expires: "",
        priority: "normal",
        global: false,
        action_url: ""
      });
      setSelectAllUsers(false);
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive"
      });
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "info": return <Bell className="h-4 w-4 text-blue-500" />;
      case "success": return <Check className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };
  
  const getNotificationSourceIcon = (source?: string) => {
    if (!source) return <Bell className="h-4 w-4 text-gray-500" />;
    
    switch (source.toLowerCase()) {
      case "stripe-webhook": return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "auth": return <Users className="h-4 w-4 text-green-500" />;
      case "scheduler": return <Calendar className="h-4 w-4 text-purple-500" />;
      case "admin-portal": return <Target className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };
  
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/20">Low</Badge>;
      case "high":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/20">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-500/20 text-red-300 border-red-400/20">Urgent</Badge>;
      case "normal":
      default:
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/20">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Badge variant="outline" className="bg-[#ea384c]/10 text-[#ea384c] border-[#ea384c]/20">
          Admin Portal
        </Badge>
      </div>

      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 text-[#ea384c] mr-2" />
            Notification Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" value={currentTab} onValueChange={(v) => setCurrentTab(v as 'user' | 'admin')}>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-[#ea384c] hover:bg-[#ea384c]/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => currentTab === 'user' ? fetchUserNotifications() : fetchAdminNotifications()}
                  className="border-[#333333]"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <TabsList className="bg-[#222] border border-[#333]">
                <TabsTrigger value="user" className="data-[state=active]:bg-[#ea384c]">
                  <Users className="h-4 w-4 mr-2" />
                  User Notifications
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-[#ea384c]">
                  <Bell className="h-4 w-4 mr-2" />
                  Admin Notifications
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-[#1A1A1A] border-[#333333]"
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] bg-[#1A1A1A] border-[#333333]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333333]">
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="user">
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card key={notification.id} className="bg-[#1A1A1A] border-[#333333]">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {getNotificationTypeIcon(notification.notification_type)}
                            <CardTitle className="text-base ml-2">{notification.title}</CardTitle>
                            {!notification.is_read && (
                              <Badge className="ml-2 bg-[#ea384c] text-white">New</Badge>
                            )}
                            {isExpired(notification.expires_at) && (
                              <Badge className="ml-2 bg-gray-500 text-white">Expired</Badge>
                            )}
                            <div className="ml-2">
                              {getPriorityBadge(notification.priority)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                              className="h-8 px-2 text-gray-400 hover:text-white"
                            >
                              {notification.is_read ? "Mark as Unread" : "Mark as Read"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="h-8 px-2 text-gray-400 hover:text-[#ea384c]"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-sm font-normal text-gray-400 mt-1">
                          Sent to: {notification.user?.full_name || notification.user?.email || notification.user_id}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                        {notification.action_url && (
                          <div className="mb-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-xs border-[#333]"
                              onClick={() => window.open(notification.action_url, '_blank')}
                            >
                              View Details
                            </Button>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Created: {formatDate(notification.created_at)}</span>
                          {notification.expires_at && (
                            <span>Expires: {formatDate(notification.expires_at)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-lg">
                  <Bell className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                  <h3 className="text-xl font-medium">No notifications found</h3>
                  <p className="text-gray-500 mt-1">
                    {searchQuery ? "Try adjusting your search or filters" : "Create a notification to get started"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="admin">
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ea384c]" />
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card key={notification.id} className="bg-[#1A1A1A] border-[#333333]">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {getNotificationTypeIcon(notification.notification_type)}
                            <CardTitle className="text-base ml-2">{notification.title}</CardTitle>
                            {!notification.is_read && (
                              <Badge className="ml-2 bg-[#ea384c] text-white">New</Badge>
                            )}
                            {isExpired(notification.expires_at) && (
                              <Badge className="ml-2 bg-gray-500 text-white">Expired</Badge>
                            )}
                            <div className="ml-2">
                              {getPriorityBadge(notification.priority)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                              className="h-8 px-2 text-gray-400 hover:text-white"
                            >
                              {notification.is_read ? "Mark as Unread" : "Mark as Read"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="h-8 px-2 text-gray-400 hover:text-[#ea384c]"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        {notification.source && (
                          <div className="flex items-center mt-1">
                            {getNotificationSourceIcon(notification.source)}
                            <span className="text-sm text-gray-400 ml-1 capitalize">
                              Source: {notification.source.replace(/-/g, ' ')}
                            </span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                        {notification.action_url && (
                          <div className="mb-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-xs border-[#333]"
                              onClick={() => window.open(notification.action_url, '_blank')}
                            >
                              View Details
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-wrap justify-between text-xs text-gray-400 gap-2">
                          <span>Created: {formatDate(notification.created_at)}</span>
                          {notification.read_at && (
                            <span>Read at: {formatDate(notification.read_at)}</span>
                          )}
                          {notification.expires_at && (
                            <span>Expires: {formatDate(notification.expires_at)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-lg">
                  <Bell className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                  <h3 className="text-xl font-medium">No admin notifications found</h3>
                  <p className="text-gray-500 mt-1">
                    {searchQuery ? "Try adjusting your search or filters" : "Create an admin notification to get started"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#111111] border-[#333] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create {currentTab === 'user' ? 'User' : 'Admin'} Notification</DialogTitle>
            <DialogDescription className="text-gray-400">
              Send a notification to {currentTab === 'user' ? 'one or more users' : 'all admins'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                placeholder="Notification title"
                className="bg-[#1a1a1a] border-[#333] text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                placeholder="Notification message"
                className="bg-[#1a1a1a] border-[#333] text-white min-h-[100px]"
              />
            </div>
            
            {currentTab === 'user' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="global"
                    checked={selectAllUsers}
                    onCheckedChange={setSelectAllUsers}
                  />
                  <Label htmlFor="global">Send to all users</Label>
                </div>
                
                {!selectAllUsers && (
                  <div>
                    <Label htmlFor="userId">Select User</Label>
                    <Select 
                      value={newNotification.userId} 
                      onValueChange={(value) => setNewNotification({...newNotification, userId: value})}
                    >
                      <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newNotification.type} 
                  onValueChange={(value) => setNewNotification({...newNotification, type: value})}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                    {notificationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newNotification.priority} 
                  onValueChange={(value) => setNewNotification({...newNotification, priority: value})}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                    {priorityLevels.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="expires">Expiration Date (Optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={newNotification.expires}
                onChange={(e) => setNewNotification({...newNotification, expires: e.target.value})}
                className="bg-[#1a1a1a] border-[#333] text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="action_url">Action URL (Optional)</Label>
              <Input
                id="action_url"
                type="url"
                value={newNotification.action_url}
                onChange={(e) => setNewNotification({...newNotification, action_url: e.target.value})}
                placeholder="https://example.com/action"
                className="bg-[#1a1a1a] border-[#333] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-[#333] text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNotification}
              className="bg-[#ea384c] hover:bg-[#ea384c]/80"
            >
              Create Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotifications;
