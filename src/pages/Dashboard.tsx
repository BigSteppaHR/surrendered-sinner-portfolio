
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DailyQuote from "@/components/dashboard/DailyQuote";
import ScheduleSession from "@/components/dashboard/ScheduleSession";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import WeightChart from "@/components/dashboard/WeightChart";
import WorkoutPlans from "@/components/dashboard/WorkoutPlans";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Calendar, TrendingUp, Dumbbell, Target, Medal, Clock } from "lucide-react";

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
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-sinner-red/50">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
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
            <StatCard icon={<Calendar className="h-5 w-5 text-green-400" />} title="Next Session" value="Tomorrow, 9:00 AM" />
            <StatCard icon={<TrendingUp className="h-5 w-5 text-blue-400" />} title="Weight Change" value="-2.5 lbs" />
            <StatCard icon={<Dumbbell className="h-5 w-5 text-purple-400" />} title="Workouts" value="16 Completed" />
            <StatCard icon={<Target className="h-5 w-5 text-red-400" />} title="Goal" value="75% Complete" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                <UpcomingSessions />
                <WorkoutPlans />
              </div>
            </div>
            
            <div className="space-y-6">
              <ScheduleSession />
              <WeightChart />

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
                  <Achievement title="Consistency King" description="Completed 5 workouts in a row" date="2 days ago" />
                  <Achievement title="Weight Milestone" description="Lost 10 lbs since starting" date="1 week ago" />
                  <Achievement title="Personal Best" description="New squat max: 225 lbs" date="2 weeks ago" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <Card className="bg-gray-900/80 border-gray-800">
    <CardContent className="p-4">
      <div className="flex items-center">
        <div className="p-2 bg-gray-800 rounded-lg mr-3">
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

const Achievement = ({ title, description, date }: { title: string, description: string, date: string }) => (
  <div className="flex items-start border-l-2 border-yellow-600 pl-3 py-1">
    <div>
      <h4 className="text-sm font-semibold flex items-center">
        <Star className="h-3 w-3 text-yellow-500 mr-1" /> {title}
      </h4>
      <p className="text-xs text-gray-400">{description}</p>
      <div className="flex items-center mt-1 text-xs text-gray-500">
        <Clock className="h-3 w-3 mr-1" /> {date}
      </div>
    </div>
  </div>
);

export default Dashboard;
