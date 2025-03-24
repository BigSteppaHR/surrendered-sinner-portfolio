
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DailyQuote from "@/components/dashboard/DailyQuote";
import ScheduleSession from "@/components/dashboard/ScheduleSession";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import WeightChart from "@/components/dashboard/WeightChart";
import WeightTracker from "@/components/dashboard/WeightTracker";
import WorkoutPlans from "@/components/dashboard/WorkoutPlans";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Star, Calendar, TrendingUp, Dumbbell, Target, Medal, Clock, 
  Zap, Trophy, Heart, FlameIcon, ActivityIcon, BarChart2
} from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    // Only set page as loaded after auth is initialized
    if (isInitialized) {
      setIsPageLoaded(true);
    }
  }, [isInitialized]);
  
  useEffect(() => {
    // Only redirect once auth is initialized to prevent flashing
    if (!isInitialized) return;
    
    // If authenticated admin, redirect to admin dashboard
    if (!isLoading && isAuthenticated && profile?.is_admin) {
      navigate("/admin", { replace: true });
      return;
    }
    
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    
    // If authenticated but email not confirmed, redirect to confirmation page
    if (!isLoading && isAuthenticated && profile && !profile.email_confirmed) {
      navigate("/confirm-email", { state: { email: profile.email }, replace: true });
      return;
    }
    
    // If coming from verification page, show welcome toast
    if (location.state?.fromVerification) {
      toast({
        title: "Welcome to your dashboard!",
        description: "Your email has been verified and you're now logged in.",
      });
      
      // Clear the state to prevent showing toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [isAuthenticated, isLoading, profile, navigate, isInitialized, location.state, toast, isAdmin]);
  
  // Show loading state while checking auth
  if (isLoading || !isInitialized || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-sinner-red/50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 to-sinner-red/30 text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome section with animated gradient border */}
          <div className="mb-8 p-6 rounded-lg relative overflow-hidden after:absolute after:inset-0 after:p-[2px] after:rounded-lg after:bg-gradient-to-r after:from-red-500 after:via-purple-500 after:to-red-500 after:opacity-75 after:animate-[gradient_5s_ease_infinite] bg-gray-900/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-500">
                  Welcome Back, {profile?.full_name || 'Athlete'}!
                </h1>
                <p className="text-gray-400 mt-1">Track your progress and stay connected with your coach</p>
              </div>
              <div className="mt-4 md:mt-0 w-full md:w-auto">
                <DailyQuote />
              </div>
            </div>
          </div>
          
          {/* Quick stats section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              icon={<Calendar className="h-5 w-5 text-green-400" />} 
              title="Next Session" 
              value="Tomorrow, 9:00 AM"
              color="from-green-500/20 to-green-700/20"
            />
            <StatCard 
              icon={<TrendingUp className="h-5 w-5 text-blue-400" />} 
              title="Weight Change" 
              value="-2.5 lbs"
              color="from-blue-500/20 to-blue-700/20"
            />
            <StatCard 
              icon={<Dumbbell className="h-5 w-5 text-purple-400" />} 
              title="Workouts" 
              value="16 Completed"
              color="from-purple-500/20 to-purple-700/20"
            />
            <StatCard 
              icon={<Target className="h-5 w-5 text-red-400" />} 
              title="Goal" 
              value="75% Complete"
              color="from-red-500/20 to-red-700/20"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PerformanceCard 
                  title="Cardio Performance" 
                  value="↑ 12%" 
                  description="Improved since last month"
                  icon={<Heart className="h-5 w-5" />}
                  color="from-pink-500/20 to-red-700/20"
                />
                <PerformanceCard 
                  title="Strength Progress" 
                  value="↑ 8%" 
                  description="Bench press max increased"
                  icon={<ActivityIcon className="h-5 w-5" />}
                  color="from-blue-500/20 to-indigo-700/20"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <WeightChart />
                <UpcomingSessions />
                <WorkoutPlans />
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <WeightTracker />
              <ScheduleSession />

              {/* Achievement Card */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-bl-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Medal className="h-5 w-5 text-yellow-500 mr-2" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Achievement 
                    title="Consistency King" 
                    description="Completed 5 workouts in a row" 
                    date="2 days ago"
                    icon={<FlameIcon className="h-3 w-3 text-orange-500" />} 
                  />
                  <Achievement 
                    title="Weight Milestone" 
                    description="Lost 10 lbs since starting" 
                    date="1 week ago"
                    icon={<TrendingUp className="h-3 w-3 text-green-500" />} 
                  />
                  <Achievement 
                    title="Personal Best" 
                    description="New squat max: 225 lbs" 
                    date="2 weeks ago"
                    icon={<Trophy className="h-3 w-3 text-yellow-500" />} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Quick action buttons */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ActionButton 
              text="Schedule Session"
              icon={<Calendar className="h-5 w-5" />}
              color="bg-gradient-to-br from-blue-600 to-blue-800"
              onClick={() => navigate('/schedule')}
            />
            <ActionButton 
              text="View Workouts"
              icon={<Dumbbell className="h-5 w-5" />}
              color="bg-gradient-to-br from-purple-600 to-purple-800"
              onClick={() => navigate('/workouts')}
            />
            <ActionButton 
              text="Track Progress"
              icon={<BarChart2 className="h-5 w-5" />}
              color="bg-gradient-to-br from-green-600 to-green-800"
              onClick={() => navigate('/progress')}
            />
            <ActionButton 
              text="Payment Plans"
              icon={<Zap className="h-5 w-5" />}
              color="bg-gradient-to-br from-red-600 to-red-800"
              onClick={() => navigate('/payment')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: string }) => (
  <Card className="bg-gray-900/80 border-gray-800 overflow-hidden relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50`}></div>
    <CardContent className="p-4 relative">
      <div className="flex items-center">
        <div className="p-2 bg-gray-800/70 rounded-lg mr-3">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400">{title}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PerformanceCard = ({ title, value, description, icon, color }: { 
  title: string, 
  value: string, 
  description: string, 
  icon: React.ReactNode,
  color: string
}) => (
  <Card className="bg-gray-900/80 border-gray-800 overflow-hidden relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50`}></div>
    <CardContent className="p-4 relative">
      <div className="flex items-start">
        <div className="p-2 bg-gray-800/70 rounded-lg mr-3">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Achievement = ({ title, description, date, icon }: { 
  title: string, 
  description: string, 
  date: string,
  icon: React.ReactNode 
}) => (
  <div className="flex items-start border-l-2 border-yellow-600 pl-3 py-1">
    <div>
      <h4 className="text-sm font-semibold flex items-center">
        {icon} <span className="ml-1">{title}</span>
      </h4>
      <p className="text-xs text-gray-400">{description}</p>
      <div className="flex items-center mt-1 text-xs text-gray-500">
        <Clock className="h-3 w-3 mr-1" /> {date}
      </div>
    </div>
  </div>
);

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
