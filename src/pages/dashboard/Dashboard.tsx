
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays, BarChart3, RefreshCw } from "lucide-react";
import DailyQuote from "@/components/dashboard/DailyQuote";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import WorkoutPlans from "@/components/dashboard/WorkoutPlans";
import UserAccountStatus from "@/components/dashboard/UserAccountStatus";
import WeightTracker from "@/components/dashboard/WeightTracker";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";

// Helper function to format last active time
const formatLastActive = (date: Date | null): string => {
  if (!date) return "Never";
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

const Dashboard = () => {
  const { profile, loginCount, lastActive } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshQuote, setRefreshQuote] = useState(false);
  
  const handleRefreshQuote = () => {
    setRefreshQuote(prev => !prev);
  };
  
  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 overflow-auto md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome Section with Gradient Border */}
          <div className="mb-8 p-6 rounded-lg relative overflow-hidden bg-zinc-900 backdrop-blur-sm border border-[#333333] hover:border-[#ea384c] transition-colors">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-gray-400 mt-1">Your training journey continues today</p>
                <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-4">
                  <span>Visits: {loginCount}</span>
                  <span>Last activity: {formatLastActive(lastActive)}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 w-full md:w-auto">
                <DailyQuote onRefresh={handleRefreshQuote} refreshTrigger={refreshQuote} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <UserAccountStatus />
            
            <Card className="bg-[#111111] border-[#333333]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-[#ea384c] mr-2" />
                    Weekly Activity
                  </div>
                </CardTitle>
                <CardDescription>Your training consistency</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Mon</div>
                  <div className="flex-1 mx-2 h-2 bg-[#1A1A1A] rounded overflow-hidden">
                    <div className="h-full bg-[#ea384c] rounded" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Tue</div>
                  <div className="flex-1 mx-2 h-2 bg-[#1A1A1A] rounded overflow-hidden">
                    <div className="h-full bg-[#ea384c] rounded" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Wed</div>
                  <div className="flex-1 mx-2 h-2 bg-[#1A1A1A] rounded overflow-hidden">
                    <div className="h-full bg-[#ea384c] rounded" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Thu</div>
                  <div className="flex-1 mx-2 h-2 bg-[#1A1A1A] rounded overflow-hidden">
                    <div className="h-full bg-[#ea384c] rounded" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Fri</div>
                  <div className="flex-1 mx-2 h-2 bg-[#1A1A1A] rounded overflow-hidden">
                    <div className="h-full bg-[#ea384c] rounded" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Sat</div>
                  <div className="flex-1 mx-2 h-2 bg-[#1A1A1A] rounded overflow-hidden">
                    <div className="h-full bg-[#ea384c] rounded" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Sun</div>
                  <div className="flex-1 mx-2 h-2 bg-[#1A1A1A] rounded overflow-hidden">
                    <div className="h-full bg-[#ea384c] rounded" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#111111] border-[#333333]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-[#ea384c] mr-2" />
                  Stats Overview
                </CardTitle>
                <CardDescription>Your training progress</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Workouts Completed</span>
                      <span className="text-sm font-medium">24/30</span>
                    </div>
                    <div className="h-2 bg-[#1A1A1A] rounded overflow-hidden">
                      <div className="h-full bg-[#ea384c]" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Goals Achieved</span>
                      <span className="text-sm font-medium">3/5</span>
                    </div>
                    <div className="h-2 bg-[#1A1A1A] rounded overflow-hidden">
                      <div className="h-full bg-[#ea384c]" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Consistency</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="h-2 bg-[#1A1A1A] rounded overflow-hidden">
                      <div className="h-full bg-[#ea384c]" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <UpcomingSessions />
            <WeightTracker />
          </div>
          
          <WorkoutPlans />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
