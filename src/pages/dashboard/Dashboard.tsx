
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DailyQuote from "@/components/dashboard/DailyQuote";
import ScheduleSession from "@/components/dashboard/ScheduleSession";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import WorkoutPlans from "@/components/dashboard/WorkoutPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Dumbbell, Target, Clock, 
  Zap, FileText, ArrowRight, Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  
  // Fetch user data when profile is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!profile?.id) return;
      
      try {
        // Fetch upcoming sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', profile.id)
          .gte('session_time', new Date().toISOString())
          .order('session_time', { ascending: true })
          .limit(3);
          
        if (sessionError) throw sessionError;
        
        // Fetch user's workout plans
        const { data: planData, error: planError } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (planError) throw planError;
        
        // Fetch subscription data
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', profile.id)
          .eq('status', 'active')
          .limit(1)
          .single();
          
        if (subError && subError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - we can ignore this
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
  }, [profile]);
  
  // If coming from verification page, show welcome toast
  useEffect(() => {
    if (location.state?.fromVerification) {
      toast({
        title: "Welcome to your dashboard!",
        description: "Your email has been verified and you're now logged in.",
      });
      
      // Clear the state to prevent showing toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome section with animated gradient border */}
      <div className="mb-8 p-6 rounded-lg relative overflow-hidden after:absolute after:inset-0 after:p-[2px] after:rounded-lg after:bg-gradient-to-r after:from-[#ea384c] after:via-red-500 after:to-[#ea384c] after:opacity-75 after:animate-[gradient_5s_ease_infinite] bg-[#111111] backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ea384c] to-red-400">
              Welcome Back, {profile?.full_name || 'Athlete'}!
            </h1>
            <p className="text-gray-400 mt-1">Your training journey continues today</p>
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <DailyQuote />
          </div>
        </div>
      </div>
      
      {/* Next session highlight card */}
      {upcomingSessions && upcomingSessions.length > 0 ? (
        <Card className="bg-[#111111] border-[#333333] mb-6 overflow-hidden relative">
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
                  className="bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                  onClick={() => navigate('/dashboard/sessions')}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#111111] border-[#333333] mb-6 overflow-hidden relative">
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
                  className="bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                  onClick={() => navigate('/dashboard/sessions')}
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
          
          {/* Featured training plan section */}
          {workoutPlans && workoutPlans.length > 0 ? (
            <Card className="bg-[#111111] border-[#333333] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#ea384c]" />
                  Featured Training Plan
                </CardTitle>
                <CardDescription>Your latest training program</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-5 mb-4">
                  <h3 className="text-lg font-bold mb-2">{workoutPlans[0].title}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {workoutPlans[0].description || 'No description provided.'}
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      className="bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                      onClick={() => navigate('/dashboard/plans')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Plan
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Button variant="ghost" className="text-[#ea384c] hover:text-[#d32d3f] hover:bg-[#ea384c]/5" onClick={() => navigate('/dashboard/plans')}>
                    View All Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#111111] border-[#333333] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#ea384c]" />
                  Training Plans
                </CardTitle>
                <CardDescription>Get customized workout programs</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-5 mb-4 text-center">
                  <h3 className="text-lg font-bold mb-2">No Training Plans Yet</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Get personalized training plans tailored to your goals and fitness level.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      className="bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                      onClick={() => navigate('/dashboard/plans')}
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

          {/* Membership card */}
          {subscriptionData ? (
            <Card className="bg-[#111111] border-[#333333] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#ea384c]/20 to-red-600/20 rounded-bl-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 text-[#ea384c] mr-2" />
                  Your Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-4">
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
                  className="w-full bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                  onClick={() => navigate('/dashboard/payment')}
                >
                  Manage Membership
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#111111] border-[#333333] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#ea384c]/20 to-red-600/20 rounded-bl-full"></div>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 text-[#ea384c] mr-2" />
                  Membership Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-4">
                  <div className="text-center mb-3">
                    <h4 className="font-medium text-[#ea384c]">No Active Membership</h4>
                    <p className="text-sm text-gray-400 mt-1">Upgrade to unlock premium features</p>
                  </div>
                  
                  <div className="flex items-center mt-4 p-3 bg-[#111111] rounded-lg">
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
                  className="w-full bg-[#ea384c] hover:bg-[#d32d3f] transition-colors"
                  onClick={() => navigate('/dashboard/payment')}
                >
                  View Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Quick action buttons */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ActionButton 
          text="Schedule Session"
          icon={<Calendar className="h-5 w-5" />}
          color="bg-gradient-to-br from-[#ea384c] to-[#ab2a37]"
          onClick={() => navigate('/dashboard/sessions')}
        />
        <ActionButton 
          text="Training Plans"
          icon={<FileText className="h-5 w-5" />}
          color="bg-gradient-to-br from-[#ab2a37] to-[#7e1f27]"
          onClick={() => navigate('/dashboard/plans')}
        />
        <ActionButton 
          text="Track Progress"
          icon={<Target className="h-5 w-5" />}
          color="bg-gradient-to-br from-[#ea384c] to-[#d32d3f]"
          onClick={() => navigate('/dashboard/progress')}
        />
        <ActionButton 
          text="Payment Plans"
          icon={<Zap className="h-5 w-5" />}
          color="bg-gradient-to-br from-red-600 to-red-800"
          onClick={() => navigate('/dashboard/payment')}
        />
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
