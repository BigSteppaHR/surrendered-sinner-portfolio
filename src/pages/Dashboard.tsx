
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

const Dashboard = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
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
  }, [isAuthenticated, isLoading, profile, navigate, isInitialized, location.state, toast]);
  
  // Show loading state while checking auth
  if (isLoading || !isInitialized || !isPageLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A1F2C] text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, {profile?.full_name || 'Athlete'}!</p>
            </div>
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <DailyQuote />
            </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
