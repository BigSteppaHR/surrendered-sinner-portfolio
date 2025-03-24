
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="mb-4">Welcome to your Surrendered Sinner dashboard!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Training</h2>
            <p>No active training plans.</p>
            <button className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Start Training</button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
            <p>No upcoming sessions scheduled.</p>
            <button className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Schedule Session</button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <p>Track your fitness journey here.</p>
            <button className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">View Progress</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
