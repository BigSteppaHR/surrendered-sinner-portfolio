
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatRelative } from 'date-fns';

interface UserSession {
  id: string;
  session_type: string;
  cost: number;
  session_time: string;
  location: string;
  is_paid: boolean;
  notes: string | null;
}

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('session_time', new Date().toISOString())
          .order('session_time', { ascending: true })
          .limit(5);
          
        if (error) throw error;
        
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const formatSessionTime = (time: string) => {
    const date = new Date(time);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      relative: formatRelative(date, new Date())
    };
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription className="text-gray-400">Your scheduled training sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => {
              const formattedTime = formatSessionTime(session.session_time);
              
              return (
                <div 
                  key={session.id} 
                  className="p-4 rounded-md bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{session.session_type}</h4>
                      <p className="text-gray-400 text-sm">{formattedTime.relative}</p>
                    </div>
                    <Badge variant={session.is_paid ? "secondary" : "outline"}>
                      {session.is_paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-300">
                      <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                      <span>{formattedTime.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>{formattedTime.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>{session.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <DollarSign className="h-4 w-4 mr-2 text-primary" />
                      <span>${session.cost.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-300">{session.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No upcoming sessions scheduled.</p>
            <p className="text-sm mt-2">Schedule a session with your coach to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingSessions;
