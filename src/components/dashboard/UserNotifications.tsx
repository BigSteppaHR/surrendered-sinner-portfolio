
import { useState, useEffect } from 'react';
import { Bell, Check, ChevronRight, Clock, MessageCircle, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
}

const UserNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .is('expires_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));

      toast({
        title: "Notification marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: "destructive",
        title: "Failed to update notification",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));

      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Failed to update notifications",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <Bell className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  return (
    <Card className="bg-zinc-900 border-[#333] hover:border-[#ea384c] transition-duration-300">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#ea384c]" />
            Notifications
          </CardTitle>
          <CardDescription>Recent updates and alerts</CardDescription>
        </div>
        {getUnreadCount() > 0 && (
          <Badge className="bg-[#ea384c]">{getUnreadCount()} New</Badge>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#ea384c] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#333] rounded-lg">
            <Bell className="h-10 w-10 mx-auto text-gray-500 mb-2" />
            <p className="text-gray-400">No notifications at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-3 border rounded-lg transition-colors hover:bg-zinc-800",
                  notification.is_read ? "border-zinc-700 bg-zinc-800/50" : "border-[#ea384c]/30 bg-[#ea384c]/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-full flex-shrink-0",
                    `bg-${notification.notification_type === 'info' ? 'blue' : 
                      notification.notification_type === 'success' ? 'green' : 
                      notification.notification_type === 'warning' ? 'yellow' : 'red'}-500/10`
                  )}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "font-medium truncate",
                        notification.is_read ? "text-gray-300" : "text-white"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {getTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm",
                      notification.is_read ? "text-gray-400" : "text-gray-300"
                    )}>
                      {notification.message}
                    </p>
                  </div>
                </div>
                {!notification.is_read && (
                  <div className="mt-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-8 px-2 text-[#ea384c] hover:bg-[#ea384c]/10 hover:text-[#ea384c]"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <Button 
                variant="link" 
                className="text-[#ea384c] p-0 h-auto"
                onClick={markAllAsRead}
                disabled={getUnreadCount() === 0}
              >
                Mark all as read
              </Button>
              <Button 
                variant="link" 
                className="text-[#ea384c] p-0 h-auto flex items-center"
                onClick={() => {
                  // Navigate to notifications page in future
                  toast({
                    title: "Coming Soon",
                    description: "Full notifications page will be available soon."
                  });
                }}
              >
                View all
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserNotifications;
