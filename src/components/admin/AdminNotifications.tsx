
import { useState, useEffect } from "react";
import { Bell, Check, Clock, XCircle, AlertCircle, Filter, RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type Notification = {
  id: string;
  title: string;
  message: string;
  user_id: string;
  is_read: boolean;
  notification_type: string;
  created_at: string;
  expires_at: string | null;
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

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    userId: "",
    expires: "",
    global: false
  });
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchNotifications = async () => {
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
      
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
    }
  }, [isAdmin]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.user?.email && notification.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === "all") return matchesSearch;
    if (filter === "read") return matchesSearch && notification.is_read;
    if (filter === "unread") return matchesSearch && !notification.is_read;
    if (filter === "expired") {
      const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();
      return matchesSearch && isExpired;
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
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({ is_read: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: !currentStatus } : notif
      ));
      
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
    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.filter(notif => notif.id !== id));
      
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
      
      // For global notifications, we need to get all user IDs
      if (newNotification.global) {
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
            expires_at: newNotification.expires ? new Date(newNotification.expires).toISOString() : null
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Notification created successfully"
        });
      }
      
      // Reset form and close dialog
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        userId: "",
        expires: "",
        global: false
      });
      setIsCreateDialogOpen(false);
      
      // Refresh notifications list
      fetchNotifications();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Badge variant="outline" className="bg-sinner-red/10 text-sinner-red border-sinner-red/20">
          Admin Portal
        </Badge>
      </div>

      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 text-sinner-red mr-2" />
            User Notifications
          </CardTitle>
          <CardDescription>Manage notifications for users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-sinner-red hover:bg-sinner-red/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchNotifications}
                  className="border-[#333333]"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-[#1A1A1A] border-[#333333]"
                  />
                  <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px] bg-[#1A1A1A] border-[#333333]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <Clock className="h-10 w-10 animate-spin text-sinner-red" />
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
                            <Badge className="ml-2 bg-sinner-red text-white">New</Badge>
                          )}
                          {isExpired(notification.expires_at) && (
                            <Badge className="ml-2 bg-gray-500 text-white">Expired</Badge>
                          )}
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
                            className="h-8 px-2 text-gray-400 hover:text-sinner-red"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="mt-1">
                        Sent to: {notification.user?.full_name || notification.user?.email || notification.user_id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
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
              <div className="flex flex-col items-center justify-center h-60">
                <Bell className="h-10 w-10 text-gray-500 mb-2" />
                <h3 className="text-lg font-medium">No notifications found</h3>
                <p className="text-sm text-gray-400">
                  {searchQuery || filter !== "all"
                    ? "No notifications match your search criteria"
                    : "There are no notifications in the system"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#111111] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
            <DialogDescription>
              Create a notification for a specific user or all users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                className="col-span-3 bg-[#1A1A1A] border-[#333333]"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                className="col-span-3 bg-[#1A1A1A] border-[#333333]"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={newNotification.type} 
                onValueChange={(value) => setNewNotification({...newNotification, type: value})}
              >
                <SelectTrigger id="type" className="col-span-3 bg-[#1A1A1A] border-[#333333]">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full ${type.color} mr-2`}></span>
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="global" className="text-right">
                  Global
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="global"
                  checked={newNotification.global}
                  onCheckedChange={(checked) => 
                    setNewNotification({...newNotification, global: checked})
                  }
                />
                <Label htmlFor="global">Send to all users</Label>
              </div>
            </div>
            
            {!newNotification.global && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  User ID
                </Label>
                <Input
                  id="userId"
                  value={newNotification.userId}
                  onChange={(e) => setNewNotification({...newNotification, userId: e.target.value})}
                  className="col-span-3 bg-[#1A1A1A] border-[#333333]"
                  placeholder="Enter user ID"
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expires" className="text-right">
                Expires
              </Label>
              <Input
                id="expires"
                type="datetime-local"
                value={newNotification.expires}
                onChange={(e) => setNewNotification({...newNotification, expires: e.target.value})}
                className="col-span-3 bg-[#1A1A1A] border-[#333333]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-[#333333]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNotification}
              className="bg-sinner-red hover:bg-sinner-red/80"
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
