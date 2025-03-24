
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Plus, CalendarDays, User, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardSupportTickets from "@/components/dashboard/DashboardSupportTickets";

type Session = {
  id: string;
  user_id: string;
  session_time: string;
  location: string;
  session_type: string;
  is_paid: boolean;
  cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const Sessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  
  useEffect(() => {
    // Load sessions data
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!user) return;
        
        const now = new Date().toISOString();
        
        // Fetch upcoming sessions
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('session_time', now)
          .order('session_time', { ascending: true });
          
        if (upcomingError) throw upcomingError;
        
        // Fetch past sessions
        const { data: pastData, error: pastError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .lt('session_time', now)
          .order('session_time', { ascending: false })
          .limit(5);
          
        if (pastError) throw pastError;
        
        setUpcomingSessions(upcomingData || []);
        setPastSessions(pastData || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  const handleViewSessionDetails = (session: Session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };
  
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatSessionTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const getSessionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength': return 'bg-blue-500 text-white';
      case 'cardio': return 'bg-green-500 text-white';
      case 'hiit': return 'bg-yellow-500 text-black';
      case 'recovery': return 'bg-purple-500 text-white';
      case 'assessment': return 'bg-gray-500 text-white';
      case 'consultation': return 'bg-sinner-red text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#333333] rounded w-1/4"></div>
          <div className="h-4 bg-[#333333] rounded w-2/4"></div>
          <div className="h-64 bg-[#333333] rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Training Sessions</h1>
        <p className="text-gray-400 mt-1">Manage your upcoming and past training sessions</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Upcoming Sessions */}
          <Card className="bg-[#111111] border-[#333333]">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-sinner-red mr-2" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription>Your scheduled training sessions</CardDescription>
                </div>
                <Button 
                  onClick={() => navigate("/dashboard/schedule")} 
                  className="bg-sinner-red hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex flex-col md:flex-row gap-4 p-4 border border-[#333333] rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                      onClick={() => handleViewSessionDetails(session)}
                    >
                      <div className="flex items-center md:items-start">
                        <div className="w-14 h-14 bg-[#1A1A1A] rounded-lg flex flex-col items-center justify-center mr-4 flex-shrink-0 border border-[#333333]">
                          <span className="text-xs text-gray-400">
                            {new Date(session.session_time).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold">
                            {new Date(session.session_time).getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{session.session_type} Session</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {formatSessionTime(session.session_time)}
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {session.location}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:ml-auto flex items-center space-x-2 mt-2 md:mt-0">
                        <Badge className={getSessionTypeColor(session.session_type)}>
                          {session.session_type}
                        </Badge>
                        {!session.is_paid && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                            Payment Due
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Upcoming Sessions</h3>
                  <p className="text-gray-400 mb-4">
                    You don't have any training sessions scheduled.
                  </p>
                  <Button 
                    onClick={() => navigate("/dashboard/schedule")} 
                    className="bg-sinner-red hover:bg-red-700"
                  >
                    Schedule Your First Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <Card className="bg-[#111111] border-[#333333]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 text-sinner-red mr-2" />
                  Past Sessions
                </CardTitle>
                <CardDescription>Your previous training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex flex-col md:flex-row gap-4 p-4 border border-[#333333] rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                      onClick={() => handleViewSessionDetails(session)}
                    >
                      <div className="flex items-center md:items-start">
                        <div className="w-14 h-14 bg-[#1A1A1A] rounded-lg flex flex-col items-center justify-center mr-4 flex-shrink-0 border border-[#333333]">
                          <span className="text-xs text-gray-400">
                            {new Date(session.session_time).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold">
                            {new Date(session.session_time).getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{session.session_type} Session</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {formatSessionTime(session.session_time)}
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {session.location}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:ml-auto flex items-center space-x-2 mt-2 md:mt-0">
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-[#0D0D0D] border-t border-[#333333] px-6 py-3">
                <Button variant="outline" className="w-full border-[#333333] text-gray-400 hover:text-white">
                  View All Past Sessions
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <DashboardSupportTickets />
        </div>
      </div>
      
      {/* Session Details Dialog */}
      <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
        <DialogContent className="bg-[#111111] border-[#333333] text-white">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedSession.session_type} Session</DialogTitle>
                <DialogDescription>
                  {formatSessionDate(selectedSession.session_time)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333]">
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <Clock className="h-4 w-4 mr-2 text-sinner-red" />
                      <span>Time</span>
                    </div>
                    <p className="text-white font-medium">
                      {formatSessionTime(selectedSession.session_time)}
                    </p>
                  </div>
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333]">
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <MapPin className="h-4 w-4 mr-2 text-sinner-red" />
                      <span>Location</span>
                    </div>
                    <p className="text-white font-medium">
                      {selectedSession.location}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333]">
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <User className="h-4 w-4 mr-2 text-sinner-red" />
                      <span>Type</span>
                    </div>
                    <div className="flex items-center">
                      <Badge className={getSessionTypeColor(selectedSession.session_type)}>
                        {selectedSession.session_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333]">
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <DollarSign className="h-4 w-4 mr-2 text-sinner-red" />
                      <span>Payment</span>
                    </div>
                    <div className="flex items-center">
                      {selectedSession.is_paid ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                          ${selectedSession.cost} - Payment Due
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedSession.notes && (
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333333]">
                    <div className="text-sm text-gray-400 mb-1">Session Notes</div>
                    <p className="text-white">
                      {selectedSession.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {!selectedSession.is_paid && (
                  <Button className="w-full sm:w-auto bg-sinner-red hover:bg-red-700">
                    Pay Now
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-[#333333]"
                  onClick={() => setShowSessionDetails(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sessions;
