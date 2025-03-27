import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DailyQuote from "@/components/dashboard/DailyQuote";
import ScheduleSession from "@/components/dashboard/ScheduleSession";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import WorkoutPlans from "@/components/dashboard/WorkoutPlans";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Dumbbell, Target, Clock, 
  Zap, FileText, ArrowRight, Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, isAdmin, loginCount, lastActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  
  useEffect(() => {
    if (isInitialized) {
      setIsPageLoaded(true);
    }
  }, [isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isLoading && isAuthenticated && isAdmin) {
      console.log("Dashboard: User is admin, redirecting to admin dashboard");
      navigate("/admin", { replace: true });
      return;
    }
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    
    if (!isLoading && isAuthenticated && profile && !profile.email_confirmed) {
      navigate("/confirm-email", { state: { email: profile.email }, replace: true });
      return;
    }
    
    if (location.state?.fromVerification) {
      toast({
        title: "Welcome to your dashboard!",
        description: "Your email has been verified and you're now logged in.",
      });
      
      window.history.replaceState({}, document.title);
    }
  }, [isAuthenticated, isLoading, profile, navigate, isInitialized, location.state, toast, isAdmin]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !profile?.id) return;
      
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', profile.id)
          .gte('session_time', new Date().toISOString())
          .order('session_time', { ascending: true })
          .limit(3);
          
        if (sessionError) throw sessionError;
        
        const { data: planData, error: planError } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (planError) throw planError;
        
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', profile.id)
          .eq('status', 'active')
          .limit(1)
          .single();
          
        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }
        
        setUpcomingSessions(sessionData || []);
        setWorkoutPlans(planData || []);
        if (subData) setSubscriptionData(subData);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, profile]);
  
  const formatLastActive = () => {
    if (!lastActive) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastActive.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  if (isLoading || !isInitialized || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8 p-6 rounded-lg relative overflow-hidden bg-zinc-900 border border-[#333333] hover:border-[#ea384c] transition-colors">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome Back, {profile?.full_name || 'Athlete'}!
                </h1>
                <p className="text-gray-400 mt-1">Your training journey continues today</p>
                <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-4">
                  <span>Visits: {loginCount}</span>
                  <span>Last activity: {formatLastActive()}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 w-full md:w-auto">
                <DailyQuote />
              </div>
            </div>
          </div>
          
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 mb-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ea384c]/10 to-red-800/10 rounded-bl-full"></div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="p-3 bg-[#ea384c]/10 text-[#ea384c] rounded-lg mr-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Next Training Session</h3>
                      <p className="text-[#ea384c] font-medium">
                        {new Date(upcomingSessions[0].session_time).toLocaleString('en-US', { 
                          weekday: 'long',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {upcomingSessions[0].session_type} at {upcomingSessions[0].location}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      className="bg-[#ea384c] hover:bg-red-600 transition-colors"
                      onClick={() => navigate('/schedule')}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800 mb-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ea384c]/10 to-red-800/10 rounded-bl-full"></div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="p-3 bg-[#ea384c]/10 text-[#ea384c] rounded-lg mr-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">No Upcoming Sessions</h3>
                      <p className="text-gray-400 text-sm mt-1">Schedule your next training session to keep making progress</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      className="bg-[#ea384c] hover:bg-red-600 transition-colors"
                      onClick={() => navigate('/schedule')}
                    >
                      Schedule Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <UpcomingSessions />
              
              {workoutPlans && workoutPlans.length > 0 ? (
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#ea384c]" />
                      Featured Training Plan
                    </CardTitle>
                    <CardDescription>Your latest training program</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-4">
                      <h3 className="text-lg font-bold mb-2">{workoutPlans[0].title}</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        {workoutPlans[0].description || 'No description provided.'}
                      </p>
                      <div className="flex space-x-3">
                        <Button 
                          className="bg-[#ea384c] hover:bg-red-600 transition-colors"
                          onClick={() => navigate('/plans')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Plan
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button variant="ghost" className="text-[#ea384c] hover:text-red-400 hover:bg-[#ea384c]/5" onClick={() => navigate('/plans')}>
                        View All Plans
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#ea384c]" />
                      Training Plans
                    </CardTitle>
                    <CardDescription>Get customized workout programs</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-4 text-center">
                      <h3 className="text-lg font-bold mb-2">No Training Plans Yet</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Get personalized training plans tailored to your goals and fitness level.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          className="bg-[#ea384c] hover:bg-red-600 transition-colors"
                          onClick={() => navigate('/plans')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Request Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <WorkoutPlans />
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <ScheduleSession />

              {subscriptionData ? (
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#ea384c]/20 to-red-600/20 rounded-bl-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 text-[#ea384c] mr-2" />
                      Your Membership
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Elite Training Package</h4>
                        <span className="text-xs px-2 py-1 bg-[#ea384c]/20 text-[#ea384c] rounded-full">Active</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Includes 12 personal training sessions per month</p>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center text-gray-400">
                          <Clock className="h-3 w-3 mr-1" /> 
                          Renews in {
                            subscriptionData.current_period_end 
                              ? Math.max(0, Math.ceil((new Date(subscriptionData.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                              : 'N/A'
                          } days
                        </span>
                        <span className="text-[#ea384c]">$199/month</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#ea384c] hover:bg-red-600 transition-colors"
                      onClick={() => navigate('/payment')}
                    >
                      Manage Membership
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#ea384c]/20 to-red-600/20 rounded-bl-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 text-[#ea384c] mr-2" />
                      Membership Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <h4 className="font-medium text-[#ea384c]">No Active Membership</h4>
                        <p className="text-sm text-gray-400 mt-1">Upgrade to unlock premium features</p>
                      </div>
                      
                      <div className="flex items-center mt-4 p-3 bg-zinc-900 rounded-lg">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-8 h-8 bg-[#ea384c]/20 rounded-full flex items-center justify-center">
                            <Dumbbell className="h-4 w-4 text-[#ea384c]" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium">Personal Training</h5>
                          <p className="text-xs text-gray-400">One-on-one coaching sessions</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#ea384c] hover:bg-red-600 transition-colors"
                      onClick={() => navigate('/payment')}
                    >
                      View Plans
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ActionButton 
              text="Schedule Session"
              icon={<Calendar className="h-5 w-5" />}
              color="bg-gradient-to-br from-[#ea384c] to-red-700"
              onClick={() => navigate('/schedule')}
            />
            <ActionButton 
              text="Training Plans"
              icon={<FileText className="h-5 w-5" />}
              color="bg-gradient-to-br from-red-700 to-red-800"
              onClick={() => navigate('/plans')}
            />
            <ActionButton 
              text="Track Progress"
              icon={<Target className="h-5 w-5" />}
              color="bg-gradient-to-br from-red-600 to-red-700"
              onClick={() => navigate('/progress')}
            />
            <ActionButton 
              text="Payment Plans"
              icon={<Zap className="h-5 w-5" />}
              color="bg-gradient-to-br from-red-800 to-red-900"
              onClick={() => navigate('/payment')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ text, icon, color, onClick }: {
  text: string,
  icon: React.ReactNode,
  color: string,
  onClick: () => void
}) => (
  <Button
    className={`h-auto py-3 ${color} hover:opacity-90 transition-opacity w-full`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center">
      <div className="bg-white/10 p-2 rounded-full mb-2">
        {icon}
      </div>
      <span className="text-xs">{text}</span>
    </div>
  </Button>
);

export default Dashboard;
